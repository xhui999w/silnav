package main

import (
	"crypto/subtle"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"log"
	"net"
	"net/http"
	"net/url"
	"os"
	"path/filepath"
	"sort"
	"strings"
	"time"
)

type orderData struct {
	Version int                            `json:"version"`
	Modes   map[string]map[string][]string `json:"modes"`
}

type stateData struct {
	Version   int                       `json:"version"`
	Revision  int64                     `json:"revision"`
	UserLinks []map[string]any          `json:"userLinks"`
	Overrides map[string]map[string]any `json:"overrides"`
	Hidden    []string                  `json:"hidden"`
}

type server struct {
	publicDir string
	dataFile  string
	stateFile string
	backupDir string
	configFiles []string
	token     string
	static    http.Handler
}

func main() {
	publicDir := envOr("SILNAV_PUBLIC_DIR", "/app/public")
	dataDir := envOr("SILNAV_DATA_DIR", "/data")
	if err := os.MkdirAll(dataDir, 0o755); err != nil {
		log.Fatal(err)
	}

	s := &server{
		publicDir: publicDir,
		dataFile:  filepath.Join(dataDir, "order.json"),
		stateFile: filepath.Join(dataDir, "state.json"),
		backupDir: filepath.Join(dataDir, "backups"),
		configFiles: []string{
			envOr("SILNAV_CONFIG_FILE", "/config/sites.js"),
			"/usr/share/nginx/html/config/sites.js",
		},
		token:     os.Getenv("SILNAV_ADMIN_TOKEN"),
		static:    http.FileServer(http.Dir(publicDir)),
	}

	mux := http.NewServeMux()
	mux.HandleFunc("/healthz", func(w http.ResponseWriter, _ *http.Request) { _, _ = io.WriteString(w, "ok\n") })
	mux.HandleFunc("/api/order", s.handleOrder)
	mux.HandleFunc("/api/state", s.handleState)
	mux.HandleFunc("/api/backups", s.handleBackups)
	mux.HandleFunc("/api/restore", s.handleRestore)
	mux.HandleFunc("/api/icon", s.handleIcon)
	mux.Handle("/", s)

	httpServer := &http.Server{
		Addr:              ":80",
		Handler:           securityHeaders(mux),
		ReadHeaderTimeout: 5 * time.Second,
		ReadTimeout:       10 * time.Second,
		WriteTimeout:      15 * time.Second,
		IdleTimeout:       60 * time.Second,
	}
	log.Printf("Silnav listening on %s", httpServer.Addr)
	log.Fatal(httpServer.ListenAndServe())
}

func envOr(key, fallback string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return fallback
}

func securityHeaders(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("X-Content-Type-Options", "nosniff")
		w.Header().Set("X-Frame-Options", "SAMEORIGIN")
		w.Header().Set("Referrer-Policy", "strict-origin-when-cross-origin")
		next.ServeHTTP(w, r)
	})
}

func (s *server) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	if r.URL.Path == "/" || r.URL.Path == "/index.html" || r.URL.Path == "/sites.js" || r.URL.Path == "/config/sites.js" {
		w.Header().Set("Cache-Control", "no-store")
	}
	if r.URL.Path == "/config/sites.js" {
		for _, configFile := range s.configFiles {
			if file, err := os.Open(configFile); err == nil {
				if info, statErr := file.Stat(); statErr == nil && !info.IsDir() {
					w.Header().Set("Content-Type", "application/javascript; charset=utf-8")
					http.ServeContent(w, r, "sites.js", info.ModTime(), file)
					file.Close()
					return
				}
				file.Close()
			}
		}
	}
	if r.URL.Path != "/" {
		path := filepath.Join(s.publicDir, filepath.FromSlash(strings.TrimPrefix(r.URL.Path, "/")))
		if info, err := os.Stat(path); errors.Is(err, os.ErrNotExist) || (err == nil && info.IsDir()) {
			http.ServeFile(w, r, filepath.Join(s.publicDir, "index.html"))
			return
		}
	}
	s.static.ServeHTTP(w, r)
}

func (s *server) authorized(r *http.Request) bool {
	if s.token == "" {
		return true
	}
	provided := strings.TrimPrefix(r.Header.Get("Authorization"), "Bearer ")
	return len(provided) == len(s.token) && subtle.ConstantTimeCompare([]byte(provided), []byte(s.token)) == 1
}

func writeAtomic(path string, value any) error {
	encoded, err := json.MarshalIndent(value, "", "  ")
	if err != nil {
		return err
	}
	tmp := path + ".tmp"
	if err := os.WriteFile(tmp, append(encoded, '\n'), 0o600); err != nil {
		return err
	}
	if err := os.Rename(tmp, path); err != nil {
		_ = os.Remove(tmp)
		return err
	}
	return nil
}

func (s *server) backupState() error {
	data, err := os.ReadFile(s.stateFile)
	if errors.Is(err, os.ErrNotExist) { return nil }
	if err != nil { return err }
	if err := os.MkdirAll(s.backupDir, 0o755); err != nil { return err }
	name := "state-" + time.Now().Format("20060102-150405.000000000") + ".json"
	if err := os.WriteFile(filepath.Join(s.backupDir, name), data, 0o600); err != nil { return err }
	entries, _ := os.ReadDir(s.backupDir)
	var names []string
	for _, entry := range entries { if !entry.IsDir() && strings.HasPrefix(entry.Name(), "state-") && strings.HasSuffix(entry.Name(), ".json") { names = append(names, entry.Name()) } }
	sort.Strings(names)
	for len(names) > 10 { _ = os.Remove(filepath.Join(s.backupDir, names[0])); names = names[1:] }
	return nil
}

func (s *server) currentState() (stateData, error) {
	data, err := os.ReadFile(s.stateFile)
	if errors.Is(err, os.ErrNotExist) { return stateData{Version:1, UserLinks:[]map[string]any{}, Overrides:map[string]map[string]any{}, Hidden:[]string{}}, nil }
	if err != nil { return stateData{}, err }
	var state stateData
	if err := json.Unmarshal(data, &state); err != nil || !validState(state) { return stateData{}, errors.New("invalid state") }
	return state, nil
}

func (s *server) handleBackups(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.Header().Set("Cache-Control", "no-store")
	if r.Method != http.MethodGet { writeError(w, http.StatusMethodNotAllowed, "不支持此请求方法"); return }
	entries, err := os.ReadDir(s.backupDir)
	if errors.Is(err, os.ErrNotExist) { writeJSON(w, http.StatusOK, map[string]any{"backups": []any{}}); return }
	if err != nil { writeError(w, http.StatusInternalServerError, "无法读取备份"); return }
	items := []map[string]any{}
	for _, entry := range entries {
		if entry.IsDir() || !strings.HasPrefix(entry.Name(), "state-") || !strings.HasSuffix(entry.Name(), ".json") { continue }
		info, err := entry.Info(); if err == nil { items = append(items, map[string]any{"name":entry.Name(), "time":info.ModTime(), "size":info.Size()}) }
	}
	sort.Slice(items, func(i,j int) bool { return items[i]["name"].(string) > items[j]["name"].(string) })
	writeJSON(w, http.StatusOK, map[string]any{"backups":items})
}

func (s *server) handleRestore(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	if r.Method != http.MethodPost { writeError(w, http.StatusMethodNotAllowed, "不支持此请求方法"); return }
	if !s.authorized(r) { writeError(w, http.StatusUnauthorized, "管理令牌不正确"); return }
	var req struct{Name string `json:"name"`}
	if err := json.NewDecoder(http.MaxBytesReader(w, r.Body, 4096)).Decode(&req); err != nil || filepath.Base(req.Name) != req.Name || !strings.HasPrefix(req.Name,"state-") || !strings.HasSuffix(req.Name,".json") { writeError(w, http.StatusBadRequest, "备份名称无效"); return }
	data, err := os.ReadFile(filepath.Join(s.backupDir, req.Name)); if err != nil { writeError(w, http.StatusNotFound, "备份不存在"); return }
	var restored stateData
	if err := json.Unmarshal(data, &restored); err != nil || !validState(restored) { writeError(w, http.StatusBadRequest, "备份格式错误"); return }
	current, _ := s.currentState(); if err := s.backupState(); err != nil { writeError(w, http.StatusInternalServerError, "无法备份当前数据"); return }
	restored.Revision = current.Revision + 1
	if err := writeAtomic(s.stateFile, restored); err != nil { writeError(w, http.StatusInternalServerError, "无法恢复备份"); return }
	writeJSON(w, http.StatusOK, restored)
}

func allowedIconHost(host string) bool {
	switch strings.ToLower(host) { case "api.iowen.cn", "favicon.im", "icons.duckduckgo.com", "www.google.com": return true }
	return false
}

func safeIconURL(target *url.URL) bool {
	if target == nil || (target.Scheme != "https" && target.Scheme != "http") || target.Hostname() == "" { return false }
	if allowedIconHost(target.Hostname()) { return true }
	ips, err := net.LookupIP(target.Hostname()); if err != nil || len(ips) == 0 { return false }
	for _, ip := range ips { if ip.IsPrivate() || ip.IsLoopback() || ip.IsLinkLocalUnicast() || ip.IsLinkLocalMulticast() || ip.IsUnspecified() { return false } }
	return true
}

func (s *server) handleIcon(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet { writeError(w, http.StatusMethodNotAllowed, "不支持此请求方法"); return }
	target, err := url.Parse(r.URL.Query().Get("url")); if err != nil || !safeIconURL(target) { writeError(w, http.StatusBadRequest, "图标来源不受支持"); return }
	client := &http.Client{Timeout:8*time.Second, CheckRedirect:func(req *http.Request, via []*http.Request) error { if len(via)>3 || !safeIconURL(req.URL) { return errors.New("redirect rejected") }; return nil }}
	resp, err := client.Get(target.String()); if err != nil { writeError(w, http.StatusBadGateway, "图标获取失败"); return }
	defer resp.Body.Close(); if resp.StatusCode < 200 || resp.StatusCode >= 300 { writeError(w, http.StatusBadGateway, "图标获取失败"); return }
	contentType := resp.Header.Get("Content-Type"); if !strings.HasPrefix(contentType, "image/") { writeError(w, http.StatusBadGateway, "返回内容不是图片"); return }
	data, err := io.ReadAll(io.LimitReader(resp.Body, 512<<10+1)); if err != nil || len(data) == 0 || len(data) > 512<<10 { writeError(w, http.StatusBadGateway, "图标数据无效或过大"); return }
	w.Header().Set("Content-Type", contentType); w.Header().Set("Cache-Control", "public, max-age=86400"); _, _ = w.Write(data)
}

func (s *server) handleState(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.Header().Set("Cache-Control", "no-store")
	w.Header().Set("X-Silnav-Auth-Required", fmt.Sprintf("%t", s.token != ""))
	switch r.Method {
	case http.MethodGet:
		data, err := os.ReadFile(s.stateFile)
		if errors.Is(err, os.ErrNotExist) {
			writeJSON(w, http.StatusOK, stateData{Version: 1, Revision: 0, UserLinks: []map[string]any{}, Overrides: map[string]map[string]any{}, Hidden: []string{}})
			return
		}
		if err != nil {
			writeError(w, http.StatusInternalServerError, "无法读取网址数据")
			return
		}
		var state stateData
		if err := json.Unmarshal(data, &state); err != nil || !validState(state) {
			writeError(w, http.StatusInternalServerError, "网址数据格式错误")
			return
		}
		_, _ = w.Write(data)
	case http.MethodPut:
		if !s.authorized(r) {
			writeError(w, http.StatusUnauthorized, "管理令牌不正确")
			return
		}
		body, err := io.ReadAll(http.MaxBytesReader(w, r.Body, 8<<20))
		if err != nil {
			writeError(w, http.StatusBadRequest, "网址数据过大")
			return
		}
		var state stateData
		if err := json.Unmarshal(body, &state); err != nil || !validState(state) {
			writeError(w, http.StatusBadRequest, "网址数据格式错误")
			return
		}
		current, err := s.currentState()
		if err != nil { writeError(w, http.StatusInternalServerError, "无法读取当前网址数据"); return }
		if state.Revision != current.Revision { writeError(w, http.StatusConflict, "数据已被其他设备更新，请重试"); return }
		if err := s.backupState(); err != nil { writeError(w, http.StatusInternalServerError, "无法创建保存前备份"); return }
		state.Revision++
		if err := writeAtomic(s.stateFile, state); err != nil {
			writeError(w, http.StatusInternalServerError, "无法保存网址数据")
			return
		}
		writeJSON(w, http.StatusOK, state)
	default:
		w.Header().Set("Allow", "GET, PUT")
		writeError(w, http.StatusMethodNotAllowed, "不支持此请求方法")
	}
}

func validState(state stateData) bool {
	if state.Version != 1 || state.Revision < 0 || state.UserLinks == nil || state.Overrides == nil || state.Hidden == nil {
		return false
	}
	if len(state.UserLinks) > 5000 || len(state.Overrides) > 5000 || len(state.Hidden) > 5000 {
		return false
	}
	for _, link := range state.UserLinks {
		if len(link) > 12 {
			return false
		}
	}
	for id, override := range state.Overrides {
		if id == "" || len(id) > 1000 || len(override) > 12 {
			return false
		}
	}
	for _, id := range state.Hidden {
		if id == "" || len(id) > 1000 {
			return false
		}
	}
	return true
}

func (s *server) handleOrder(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.Header().Set("Cache-Control", "no-store")
	switch r.Method {
	case http.MethodGet:
		w.Header().Set("X-Silnav-Auth-Required", fmt.Sprintf("%t", s.token != ""))
		data, err := os.ReadFile(s.dataFile)
		if errors.Is(err, os.ErrNotExist) {
			writeJSON(w, http.StatusOK, orderData{Version: 1, Modes: map[string]map[string][]string{}})
			return
		}
		if err != nil {
			writeError(w, http.StatusInternalServerError, "无法读取排序配置")
			return
		}
		var order orderData
		if err := json.Unmarshal(data, &order); err != nil || !validOrder(order) {
			writeError(w, http.StatusInternalServerError, "排序配置格式错误")
			return
		}
		w.Write(data)
	case http.MethodPut:
		if !s.authorized(r) {
			writeError(w, http.StatusUnauthorized, "管理令牌不正确")
			return
		}
		body, err := io.ReadAll(http.MaxBytesReader(w, r.Body, 256<<10))
		if err != nil {
			writeError(w, http.StatusBadRequest, "排序数据过大")
			return
		}
		var order orderData
		if err := json.Unmarshal(body, &order); err != nil || !validOrder(order) {
			writeError(w, http.StatusBadRequest, "排序数据格式错误")
			return
		}
		if err := writeAtomic(s.dataFile, order); err != nil {
			writeError(w, http.StatusInternalServerError, "无法保存排序配置")
			return
		}
		writeJSON(w, http.StatusOK, map[string]bool{"ok": true})
	default:
		w.Header().Set("Allow", "GET, PUT")
		writeError(w, http.StatusMethodNotAllowed, "不支持此请求方法")
	}
}

func validOrder(order orderData) bool {
	if order.Version != 1 || order.Modes == nil || len(order.Modes) > 4 {
		return false
	}
	for mode, categories := range order.Modes {
		if mode != "internal" && mode != "external" || len(categories) > 200 {
			return false
		}
		for category, keys := range categories {
			if category == "" || len(category) > 200 || len(keys) > 2000 {
				return false
			}
			for _, key := range keys {
				if key == "" || len(key) > 1000 {
					return false
				}
			}
		}
	}
	return true
}

func writeError(w http.ResponseWriter, status int, message string) {
	writeJSON(w, status, map[string]string{"error": message})
}

func writeJSON(w http.ResponseWriter, status int, value any) {
	w.WriteHeader(status)
	if err := json.NewEncoder(w).Encode(value); err != nil {
		fmt.Fprintln(os.Stderr, err)
	}
}

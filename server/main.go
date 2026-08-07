package main

import (
	"crypto/subtle"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"
)

type orderData struct {
	Version int                            `json:"version"`
	Modes   map[string]map[string][]string `json:"modes"`
}

type server struct {
	publicDir string
	dataFile  string
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
		if s.token != "" {
			provided := strings.TrimPrefix(r.Header.Get("Authorization"), "Bearer ")
			if len(provided) != len(s.token) || subtle.ConstantTimeCompare([]byte(provided), []byte(s.token)) != 1 {
				writeError(w, http.StatusUnauthorized, "管理令牌不正确")
				return
			}
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
		encoded, _ := json.MarshalIndent(order, "", "  ")
		tmp := s.dataFile + ".tmp"
		if err := os.WriteFile(tmp, append(encoded, '\n'), 0o600); err != nil {
			writeError(w, http.StatusInternalServerError, "无法写入排序配置")
			return
		}
		if err := os.Rename(tmp, s.dataFile); err != nil {
			os.Remove(tmp)
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

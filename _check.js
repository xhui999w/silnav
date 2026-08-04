
(function(){
  var cfg = window.NAV_CONFIG || {title:"Silnav静航"};
  document.getElementById('title').textContent = cfg.title || "Silnav静航";
  if(cfg.logo) document.getElementById('logo').textContent = cfg.logo;

  var engines = cfg.searchEngines || [
    {name:"百度", url:"https://www.baidu.com/s?wd="},
    {name:"必应", url:"https://www.bing.com/search?q="},
    {name:"Google", url:"https://www.google.com/search?q="}
  ];
  var engineIndex = 0;
  var defaultEngine = cfg.searchEngine || "百度";
  engines.forEach(function(e,i){ if(e.name === defaultEngine) engineIndex = i; });
  var searchBtn = document.getElementById('searchBtn');
  function updateEngineBtn(){ searchBtn.textContent = engines[engineIndex].name; }
  updateEngineBtn();

  // ---------- 自动识别当前网络环境（依据导航页自身被访问的网址）----------
  function isPrivateIp(h){
    var m = h.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
    if(!m) return false;
    var a=+m[1], b=+m[2];
    if(a===10) return true;
    if(a===192 && b===168) return true;
    if(a===172 && b>=16 && b<=31) return true;
    if(a===127) return true;
    return false;
  }
  function detect(){
    var h = location.hostname.toLowerCase();
    var hosts = (cfg.internalHosts||[]).map(function(s){return s.toLowerCase();});
    if(hosts.indexOf(h) >= 0) return 'internal';
    var pre = cfg.internalIpPrefixes || [];
    for(var i=0;i<pre.length;i++){ if(h.indexOf(pre[i].toLowerCase()) === 0) return 'internal'; }
    if(isPrivateIp(h)) return 'internal';
    return 'external';
  }
  var mode = detect();

  function isIpOrLocal(host){
    return host === 'localhost' || /^\d{1,3}(\.\d{1,3}){3}$/.test(host);
  }
  // 多源抓取 favicon：依次尝试，失败自动换下一个；均失败回调 onFail
  function tryFavicons(url, imgEl, onFail){
    var host;
    try { host = new URL(url).hostname; } catch(e){ onFail(); return; }
    if(!host || isIpOrLocal(host)){ onFail(); return; }
    var sources = [
      'https://api.iowen.cn/favicon/' + host + '.png',
      'https://favicon.im/' + encodeURIComponent(host),
      'https://icons.duckduckgo.com/ip3/' + host + '.ico',
      'https://www.google.com/s2/favicons?domain=' + encodeURIComponent(host) + '&sz=32'
    ];
    var i = 0;
    function next(){
      if(i >= sources.length){ onFail(); return; }
      imgEl.src = sources[i++];
    }
    imgEl.onerror = next;
    next();
  }
  function collapsedKey(catName){ return 'nav_collapsed_' + mode + '_' + catName; }

  // NAS 设备按当前环境选地址
  function nasDisplayLink(link){
    var url = (mode === 'internal' && link.internal) ? link.internal
            : (link.external || link.internal);
    return { name: link.name, url: url, icon: link.icon };
  }

  // ---------- 用户自行添加的链接（localStorage）----------
  function loadUserLinks(){
    try { return JSON.parse(localStorage.getItem('nav_user_links') || '[]'); }
    catch(e){ return []; }
  }
  function saveUserLinks(arr){ localStorage.setItem('nav_user_links', JSON.stringify(arr)); }

  // ---------- 自动识别分类：根据网址域名匹配已有链接 ----------
  function regDomain(host){
    if(!host) return '';
    var parts = host.toLowerCase().split('.');
    if(parts.length <= 2) return parts.join('.');
    var twoLevel = ['com.cn','net.cn','org.cn','gov.cn','edu.cn','co.uk','com.hk','com.tw'];
    if(twoLevel.indexOf(parts.slice(-2).join('.')) >= 0) return parts.slice(-3).join('.');
    return parts.slice(-2).join('.');
  }
  function buildDomainMap(){
    var map = {};
    function addScope(s){
      if(s && s.categories) s.categories.forEach(function(c){
        (c.links||[]).forEach(function(l){
          try { var d = regDomain(new URL(l.url||l.internal||'').hostname); if(d) (map[d]=map[d]||[]).push(c.name); } catch(e){}
        });
      });
    }
    addScope(cfg.internal); addScope(cfg.external);
    loadUserLinks().forEach(function(l){
      if(l.url){ try{ var d=regDomain(new URL(l.url).hostname); if(d) (map[d]=map[d]||[]).push(l.category||'我的收藏'); }catch(e){} }
    });
    return map;
  }
  function autoDetectCat(){
    var raw = mUrl.value.trim();
    if(!raw) return;
    if(!/^https?:\/\//i.test(raw)) raw = 'https://' + raw;
    try {
      var d = regDomain(new URL(raw).hostname);
      var map = buildDomainMap();
      var cand = (map[d] || []).slice();
      if(!cand.length){
        Object.keys(map).forEach(function(k){ if(d.indexOf(k) >= 0 && d !== k) cand = cand.concat(map[k]); });
      }
      var pick = null;
      cand.forEach(function(c){ if(!pick && c !== '我的收藏') pick = c; });
      if(!pick && cand.length) pick = cand[0];
      if(pick){
        var opts = mCatSelect.options;
        for(var i=0;i<opts.length;i++){ if(opts[i].value === pick){ mCatSelect.value = pick; return; } }
      }
    } catch(e){}
  }

  function createChip(link, uid){
    var a = document.createElement('a');
    a.href = link.url; a.target = '_blank'; a.rel = 'noopener'; a.className = 'chip';
    a.title = (link.name || link.url) + ' — ' + link.url;
    var initial = (link.icon || link.name || '?').charAt(0);
    var txtIcon = document.createElement('span'); txtIcon.className = 'txt-icon'; txtIcon.textContent = initial;

    if (link.icon) {
      a.appendChild(txtIcon);
    } else if (cfg.useFavicon !== false) {
      var img = document.createElement('img'); img.alt = '';
      txtIcon.style.display = 'none';
      tryFavicons(link.url, img, function(){
        img.style.display = 'none';
        txtIcon.style.display = 'flex';
      });
      a.appendChild(img);
      a.appendChild(txtIcon);
    } else {
      a.appendChild(txtIcon);
    }
    var span = document.createElement('span'); span.textContent = link.name || link.url;
    a.appendChild(span);

    if (uid) {
      var del = document.createElement('span'); del.className = 'chip-del'; del.textContent = '×';
      del.title = '删除';
      del.addEventListener('click', function(e){
        e.preventDefault(); e.stopPropagation();
        saveUserLinks(loadUserLinks().filter(function(x){ return x.id !== uid; }));
        render();
      });
      a.appendChild(del);
    }
    return a;
  }

  function render(){
    var q = (document.getElementById('search').value || '').trim().toLowerCase();
    var main = document.getElementById('main');
    main.innerHTML = '';

    var cats = [];
    if (cfg.nas && cfg.nas.length) cats.push({ name:"NAS", nas:true, links: cfg.nas.slice() });
    var scope = (mode === 'internal') ? cfg.internal : cfg.external;
    (scope && scope.categories || []).forEach(function(c){ cats.push(c); });

    // 合并用户添加的链接
    var uls = loadUserLinks();
    var nasUser = uls.filter(function(l){ return l.nas; });
    var favUser = uls.filter(function(l){ return !l.nas; });
    var nasCat = cats[0] && cats[0].nas ? cats[0] : null;
    if (nasUser.length && nasCat) nasCat.links = nasCat.links.concat(nasUser);
    if (favUser.length) {
      // 按所选分类分组
      var groups = {};
      favUser.forEach(function(l){
        var k = l.category || '我的收藏';
        (groups[k] = groups[k] || []).push(l);
      });
      Object.keys(groups).forEach(function(k){
        var found = null;
        for (var i=0;i<cats.length;i++){ if(cats[i].name===k){ found=cats[i]; break; } }
        if (found){ found.links = (found.links||[]).concat(groups[k]); }
        else { cats.push({ name:k, user:true, links: groups[k] }); }
      });
    }

    var total = 0;
    cats.forEach(function(cat){
      var allLinks = cat.links || [];
      var links = allLinks.filter(function(it){
        if(!q) return true;
        var hay = ((it.name||'') + ' ' + (it.url||'') + ' ' + (it.internal||'') + ' ' + (it.external||'')).toLowerCase();
        return hay.indexOf(q) >= 0;
      });
      if(!links.length) return;

      var section = document.createElement('section'); section.className = 'category';
      var head = document.createElement('div'); head.className = 'cat-header';
      head.title = '左键折叠/展开 · 右键快速添加网址到此分类';
      var dot = document.createElement('span'); dot.className = 'cat-dot';
      var name = document.createElement('span'); name.className = 'cat-name'; name.textContent = cat.name;
      var count = document.createElement('span'); count.className = 'cat-count'; count.textContent = links.length;
      var arrow = document.createElement('span'); arrow.className = 'cat-arrow'; arrow.textContent = '▼';
      head.appendChild(dot); head.appendChild(name); head.appendChild(count); head.appendChild(arrow);

      var chips = document.createElement('div'); chips.className = 'chips';
      links.forEach(function(link){
        if (cat.nas) {
          chips.appendChild(createChip(nasDisplayLink(link), link.id));
        } else {
          chips.appendChild(createChip(link, link.id));
        }
      });
      total += links.length;

      var isCollapsed = localStorage.getItem(collapsedKey(cat.name)) === '1';
      if(isCollapsed){ chips.classList.add('collapsed'); arrow.classList.add('collapsed'); }

      head.addEventListener('click', function(){
        var now = chips.classList.toggle('collapsed');
        arrow.classList.toggle('collapsed');
        localStorage.setItem(collapsedKey(cat.name), now ? '1' : '0');
      });
      head.addEventListener('contextmenu', function(e){
        e.preventDefault();
        openModal(cat.name);
      });

      section.appendChild(head); section.appendChild(chips);
      main.appendChild(section);
    });

    if(!total){
      main.innerHTML = '<div class="empty">没有匹配的网址</div>';
    }
    document.getElementById('hint').textContent = '右键分类可快速添加网址；你添加的链接仅保存在本浏览器。';
  }

  // ---------- 添加网址弹窗 ----------
  var modal = document.getElementById('modal');
  var mName = document.getElementById('mName'), mUrl = document.getElementById('mUrl');
  var mCatSelect = document.getElementById('mCatSelect'), mCatNew = document.getElementById('mCatNew'), mCatNewWrap = document.getElementById('mCatNewWrap');
  var mNormal = document.getElementById('mNormal');
  var mErr = document.getElementById('mErr');

  function openModal(presetCat){
    mName.value=''; mUrl.value=''; mErr.textContent='';
    // 填充分类下拉（当前模式 + 另一模式已有的分类 + 用户自建分类 + 我的收藏 + 新建）
    var names = [];
    var scope = (mode === 'internal') ? cfg.internal : cfg.external;
    var other = (mode === 'internal') ? cfg.external : cfg.internal;
    if(scope && scope.categories) scope.categories.forEach(function(c){ names.push(c.name); });
    if(other && other.categories) other.categories.forEach(function(c){ if(names.indexOf(c.name)<0) names.push(c.name); });
    loadUserLinks().forEach(function(l){ var c=l.category||'我的收藏'; if(names.indexOf(c)<0) names.push(c); });
    if(names.indexOf('我的收藏')<0) names.push('我的收藏');
    mCatSelect.innerHTML = '';
    names.forEach(function(n){ var o=document.createElement('option'); o.value=n; o.textContent=n; mCatSelect.appendChild(o); });
    var on = document.createElement('option'); on.value='__new__'; on.textContent='＋ 新建分类…'; mCatSelect.appendChild(on);

    {
      mNormal.style.display='block';
      if(presetCat && presetCat !== '我的收藏'){
        // 确保预设分类在下拉里存在
        var exists = false;
        for(var i=0;i<mCatSelect.options.length;i++){ if(mCatSelect.options[i].value===presetCat){ exists=true; break; } }
        if(!exists){ var o2=document.createElement('option'); o2.value=presetCat; o2.textContent=presetCat; mCatSelect.insertBefore(o2, mCatSelect.lastChild); }
        mCatSelect.value = presetCat;
        mCatNewWrap.style.display='none'; mCatNew.value='';
      } else {
        mCatSelect.value = '我的收藏';
        mCatNewWrap.style.display='none'; mCatNew.value='';
      }
    }
    modal.classList.remove('hidden'); mName.focus();
  }
  function closeModal(){ modal.classList.add('hidden'); }

  document.getElementById('mCancel').addEventListener('click', closeModal);
  modal.addEventListener('click', function(e){ if(e.target === modal) closeModal(); });
  mUrl.addEventListener('input', autoDetectCat);
  mCatSelect.addEventListener('change', function(){
    var isNew = mCatSelect.value === '__new__';
    mCatNewWrap.style.display = isNew ? 'block' : 'none';
    if(isNew) mCatNew.focus();
  });

  document.getElementById('mSave').addEventListener('click', function(){
    var name = mName.value.trim();
    if(!name){ mErr.textContent = '请填写名称'; return; }
    var arr = loadUserLinks();
    {
      var url = mUrl.value.trim();
      if(!url){ mErr.textContent = '请填写网址'; return; }
      if(!/^https?:\/\//i.test(url)) url = 'https://' + url;
      var cat = (mCatSelect.value === '__new__') ? mCatNew.value.trim() : mCatSelect.value;
      if(!cat) cat = '我的收藏';
      arr.push({ id: Date.now(), name: name, url: url, category: cat });
    }
    saveUserLinks(arr); closeModal(); render();
  });

  document.getElementById('search').addEventListener('input', render);
  document.getElementById('search').addEventListener('keydown', function(e){
    if(e.key === 'Enter'){
      var q = this.value.trim();
      if(q) window.open(engines[engineIndex].url + encodeURIComponent(q), '_blank');
    }
  });
  document.getElementById('searchBtn').addEventListener('click', function(){
    engineIndex = (engineIndex + 1) % engines.length;
    updateEngineBtn();
    var q = document.getElementById('search').value.trim();
    if(q) window.open(engines[engineIndex].url + encodeURIComponent(q), '_blank');
  });

  render();
})();

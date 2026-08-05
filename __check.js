
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
  var engineName = document.getElementById('engineName');
  var engineMenu = document.getElementById('engineMenu');
  function renderEngineMenu(){
    engineMenu.innerHTML = '';
    engines.forEach(function(e, i){
      var it = document.createElement('div');
      it.className = 'engine-item' + (i === engineIndex ? ' active' : '');
      it.innerHTML = '<span></span><span class="tick">✓</span>';
      it.firstChild.textContent = e.name;
      it.addEventListener('click', function(ev){
        ev.stopPropagation();
        engineIndex = i;
        engineName.textContent = e.name;
        renderEngineMenu();
        engineMenu.classList.remove('open');
      });
      engineMenu.appendChild(it);
    });
  }
  engineName.textContent = engines[engineIndex].name;
  renderEngineMenu();

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

  // ---------- 用户自行添加的链接（localStorage）----------
  function loadUserLinks(){
    try { return JSON.parse(localStorage.getItem('nav_user_links') || '[]'); }
    catch(e){ return []; }
  }
  function saveUserLinks(arr){ localStorage.setItem('nav_user_links', JSON.stringify(arr)); }

  // ---------- 对「配置内网站」的本地覆盖（不修改 sites.js，可恢复）----------
  function loadOverrides(){ try { return JSON.parse(localStorage.getItem('nav_overrides') || '{}'); } catch(e){ return {}; } }
  function saveOverrides(o){ localStorage.setItem('nav_overrides', JSON.stringify(o)); }
  function loadHidden(){ try { return JSON.parse(localStorage.getItem('nav_hidden') || '[]'); } catch(e){ return []; } }
  function saveHidden(a){ localStorage.setItem('nav_hidden', JSON.stringify(a)); }

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

  function isImgUrl(s){
    return typeof s === 'string' && (/^(https?:\/\/|data:image\/)/i.test(s));
  }
  function findUserLink(id){
    var arr = loadUserLinks();
    for (var i=0;i<arr.length;i++){ if(arr[i].id === id) return arr[i]; }
    return null;
  }
  function openEditModal(item){
    if (item.isUser) openModal(null, { user: findUserLink(item.uid) });
    else openModal(item.catName, { cfgId: item.uid, base: { name:item.name, url:item.editUrl||item.url, icon:item.icon, category:item.catName } });
  }
  function createChip(item){
    var a = document.createElement('a');
    a.href = item.url; a.target = '_blank'; a.rel = 'noopener'; a.className = 'chip';
    a.title = (item.name || item.url) + ' — ' + item.url;
    // 编辑模式下点卡片任意位置都直接打开「修改」，不再跳转网站
    a.addEventListener('click', function(e){
      if(document.body.classList.contains('editing')){
        e.preventDefault();
        openEditModal(item);
      }
    });
    var initial = (item.name || '?').charAt(0);
    var txtIcon = document.createElement('span'); txtIcon.className = 'txt-icon'; txtIcon.textContent = initial;

    if (isImgUrl(item.icon)) {
      var cimg = document.createElement('img'); cimg.alt = '';
      cimg.onerror = function(){ cimg.style.display='none'; txtIcon.style.display='flex'; };
      cimg.src = item.icon;
      txtIcon.style.display = 'none';
      a.appendChild(cimg); a.appendChild(txtIcon);
    } else if (cfg.useFavicon !== false) {
      var img = document.createElement('img'); img.alt = '';
      txtIcon.style.display = 'none';
      tryFavicons(item.url, img, function(){
        img.style.display = 'none';
        txtIcon.style.display = 'flex';
      });
      a.appendChild(img);
      a.appendChild(txtIcon);
    } else {
      a.appendChild(txtIcon);
    }
    var span = document.createElement('span'); span.textContent = item.name || item.url;
    a.appendChild(span);

    var edit = document.createElement('span'); edit.className = 'chip-edit'; edit.textContent = '✎';
    edit.title = '修改';
    edit.addEventListener('click', function(e){
      e.preventDefault(); e.stopPropagation();
      openEditModal(item);
    });
    a.appendChild(edit);
    var del = document.createElement('span'); del.className = 'chip-del'; del.textContent = '×';
    del.title = '删除';
    del.addEventListener('click', function(e){
      e.preventDefault(); e.stopPropagation();
      if (item.isUser) saveUserLinks(loadUserLinks().filter(function(x){ return x.id !== item.uid; }));
      else { var h = loadHidden(); if(h.indexOf(item.uid) < 0){ h.push(item.uid); saveHidden(h); } }
      render();
    });
    a.appendChild(del);
    return a;
  }

  function render(){
    var q = (document.getElementById('search').value || '').trim().toLowerCase();
    var main = document.getElementById('main');
    main.innerHTML = '';

    var overrides = loadOverrides();
    var hidden = loadHidden();
    var uls = loadUserLinks();
    var items = [];

    // NAS（配置内）
    if (cfg.nas && cfg.nas.length){
      cfg.nas.forEach(function(link, i){
        var id = 'nas:' + i;
        if (hidden.indexOf(id) >= 0) return;
        var ov = overrides[id];
        var ext = (ov && ov.external != null) ? ov.external : link.external;
        var disp = (mode === 'internal' && link.internal) ? link.internal : (ext || link.internal);
        items.push({ uid:id, isUser:false, isNas:true,
          name:(ov && ov.name != null ? ov.name : link.name),
          url:disp, editUrl:ext,
          icon:(ov && ov.icon != null ? ov.icon : link.icon),
          catName:'NAS' });
      });
    }

    // 配置内分类网址
    var scope = (mode === 'internal') ? cfg.internal : cfg.external;
    (scope && scope.categories || []).forEach(function(c){
      (c.links||[]).forEach(function(link, i){
        var id = 'cfg:' + c.name + ':' + i;
        if (hidden.indexOf(id) >= 0) return;
        var ov = overrides[id];
        var name = (ov && ov.name != null) ? ov.name : link.name;
        var url = (ov && ov.url != null) ? ov.url : link.url;
        var icon = (ov && ov.icon != null) ? ov.icon : link.icon;
        var catName = (ov && ov.category != null) ? ov.category : c.name;
        items.push({ uid:id, isUser:false, isNas:false, name:name, url:url, icon:icon, catName:catName });
      });
    });

    // 用户自行添加的链接（localStorage）
    uls.forEach(function(l){
      var id = l.id;
      if (hidden.indexOf('user:' + id) >= 0) return;
      if (l.nas){
        var disp = (mode === 'internal' && l.internal) ? l.internal : (l.external || l.internal);
        items.push({ uid:id, isUser:true, isNas:true, name:l.name, url:disp, icon:l.icon, catName:'NAS' });
      } else {
        items.push({ uid:id, isUser:true, isNas:false, name:l.name, url:l.url, icon:l.icon, catName:l.category||'我的收藏' });
      }
    });

    // 分类顺序：先配置顺序，再用户自建
    var orderedCats = [], catOrder = {};
    function ensureCat(n){ if(!(n in catOrder)){ catOrder[n]=orderedCats.length; orderedCats.push(n); } }
    if (cfg.nas && cfg.nas.length) ensureCat('NAS');
    (scope && scope.categories || []).forEach(function(c){ ensureCat(c.name); });
    uls.forEach(function(l){ ensureCat(l.category || '我的收藏'); });

    var groups = {};
    items.forEach(function(it){
      if (!q || ((it.name||'') + ' ' + (it.url||'')).toLowerCase().indexOf(q) >= 0){
        (groups[it.catName] = groups[it.catName] || []).push(it);
      }
    });

    var total = 0;
    orderedCats.forEach(function(catName){
      var links = groups[catName];
      if(!links || !links.length) return;

      var section = document.createElement('section'); section.className = 'category';
      var head = document.createElement('div'); head.className = 'cat-header';
      head.title = '左键折叠/展开 · 点击 + 添加网址到此分类';
      var dot = document.createElement('span'); dot.className = 'cat-dot';
      var name = document.createElement('span'); name.className = 'cat-name'; name.textContent = catName;
      var count = document.createElement('span'); count.className = 'cat-count'; count.textContent = links.length;
      var addBtn = document.createElement('span'); addBtn.className = 'cat-add'; addBtn.textContent = '+';
      addBtn.title = '添加网址到「' + catName + '」';
      var arrow = document.createElement('span'); arrow.className = 'cat-arrow'; arrow.textContent = '▼';
      head.appendChild(dot); head.appendChild(name); head.appendChild(count); head.appendChild(addBtn); head.appendChild(arrow);

      var chips = document.createElement('div'); chips.className = 'chips';
      links.forEach(function(it){ chips.appendChild(createChip(it)); });
      total += links.length;

      var isCollapsed = localStorage.getItem(collapsedKey(catName)) === '1';
      if(isCollapsed){ chips.classList.add('collapsed'); arrow.classList.add('collapsed'); }

      head.addEventListener('click', function(){
        var now = chips.classList.toggle('collapsed');
        arrow.classList.toggle('collapsed');
        localStorage.setItem(collapsedKey(catName), now ? '1' : '0');
      });
      addBtn.addEventListener('click', function(e){
        e.preventDefault(); e.stopPropagation();
        openModal(catName);
      });

      section.appendChild(head); section.appendChild(chips);
      main.appendChild(section);
    });

    if(!total){
      main.innerHTML = '<div class="empty">没有匹配的网址</div>';
    }
    document.getElementById('hint').innerHTML = '点击分类右侧的 + 可添加网址；点顶部「编辑」后，链接上会显示 ✎ 修改 / × 删除（均仅保存在本浏览器）。<span id="resetLocal" style="color:var(--accent);cursor:pointer;margin-left:6px;">恢复默认</span>';
    var rl = document.getElementById('resetLocal');
    if(rl) rl.addEventListener('click', function(){
      if(confirm('确定清除本机对网址的所有修改/删除，恢复 sites.js 默认？')){
        localStorage.removeItem('nav_overrides'); localStorage.removeItem('nav_hidden'); render();
      }
    });
  }

  // ---------- 添加网址弹窗 ----------
  var modal = document.getElementById('modal');
  var mName = document.getElementById('mName'), mUrl = document.getElementById('mUrl');
  var mCatSelect = document.getElementById('mCatSelect'), mCatNew = document.getElementById('mCatNew'), mCatNewWrap = document.getElementById('mCatNewWrap');
  var mNormal = document.getElementById('mNormal');
  var mErr = document.getElementById('mErr');
  var mIcon = document.getElementById('mIcon'), mIconFile = document.getElementById('mIconFile');
  var editingUser = null, editingCfgId = null;

  function openModal(presetCat, opts){
    mErr.textContent=''; mIcon.value=''; mIconFile.value='';
    editingUser = null; editingCfgId = null;
    if (opts && opts.user) {
      editingUser = opts.user;
      document.querySelector('.modal-title').textContent = '修改网址';
      mName.value = editingUser.name || '';
      mUrl.value = editingUser.url || '';
      mIcon.value = editingUser.icon || '';
      presetCat = editingUser.category || presetCat;
    } else if (opts && opts.cfgId) {
      editingCfgId = opts.cfgId;
      document.querySelector('.modal-title').textContent = '修改网址';
      mName.value = opts.base.name || '';
      mUrl.value = opts.base.url || '';
      mIcon.value = opts.base.icon || '';
      presetCat = opts.base.category || presetCat;
    } else {
      document.querySelector('.modal-title').textContent = '添加网址';
      mName.value=''; mUrl.value='';
    }
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
    updateIconPreview();
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
  mIconFile.addEventListener('change', function(){
    var f = mIconFile.files && mIconFile.files[0];
    if(!f) return;
    var r = new FileReader();
    r.onload = function(){ mIcon.value = r.result; updateIconPreview(); };
    r.readAsDataURL(f);
  });
  mIcon.addEventListener('input', updateIconPreview);
  function updateIconPreview(){
    var pv = document.getElementById('mIconPreview');
    if(mIcon.value){ pv.src = mIcon.value; pv.style.display = 'inline-block'; }
    else { pv.style.display = 'none'; }
  }
  // 一键获取图标：按多源顺序抓取 favicon 并填入图标框
  document.getElementById('mFetchIcon').addEventListener('click', function(){
    var raw = mUrl.value.trim();
    if(!raw){ mErr.textContent = '请先填写网址'; return; }
    if(!/^https?:\/\//i.test(raw)) raw = 'https://' + raw;
    var host;
    try { host = new URL(raw).hostname; } catch(e){ mErr.textContent = '网址无效'; return; }
    if(isIpOrLocal(host)){ mErr.textContent = '内网/本地地址无法自动获取图标'; return; }
    mErr.textContent = '';
    var sources = [
      'https://api.iowen.cn/favicon/' + host + '.png',
      'https://favicon.im/' + encodeURIComponent(host),
      'https://icons.duckduckgo.com/ip3/' + host + '.ico',
      'https://www.google.com/s2/favicons?domain=' + encodeURIComponent(host) + '&sz=32'
    ];
    var i = 0;
    (function tryNext(){
      if(i >= sources.length){ mErr.textContent = '未能自动获取图标，可手动粘贴图片网址'; return; }
      var img = new Image();
      img.onload = function(){ mIcon.value = sources[i]; updateIconPreview(); };
      img.onerror = function(){ i++; tryNext(); };
      img.src = sources[i];
    })();
  });

  document.getElementById('mSave').addEventListener('click', function(){
    var name = mName.value.trim();
    if(!name){ mErr.textContent = '请填写名称'; return; }
    var url = mUrl.value.trim();
    if(!url){ mErr.textContent = '请填写网址'; return; }
    if(!/^https?:\/\//i.test(url)) url = 'https://' + url;
    var cat = (mCatSelect.value === '__new__') ? mCatNew.value.trim() : mCatSelect.value;
    if(!cat) cat = '我的收藏';
    var icon = mIcon.value.trim();
    var iconVal = icon ? icon : '';

    // 编辑「配置内网站」：写入本地覆盖，不改动 sites.js
    if (editingCfgId != null) {
      var ov = {};
      if (editingCfgId.indexOf('nas:') === 0){
        ov.name = name; ov.external = url; if(iconVal) ov.icon = iconVal;
      } else {
        ov.name = name; ov.url = url; ov.category = cat; if(iconVal) ov.icon = iconVal;
      }
      var overrides = loadOverrides();
      overrides[editingCfgId] = ov;
      saveOverrides(overrides);
      closeModal(); render();
      return;
    }

    // 编辑「用户自行添加的链接」
    if (editingUser != null) {
      var arr = loadUserLinks();
      var found = false;
      arr = arr.map(function(l){
        if(l.id === editingUser.id){
          found = true;
          return { id: l.id, name: name, url: url, category: cat, icon: iconVal || undefined, nas: l.nas };
        }
        return l;
      });
      if(!found){ mErr.textContent = '未找到该链接'; return; }
      saveUserLinks(arr); closeModal(); render();
      return;
    }

    // 新增用户链接
    var uls = loadUserLinks();
    uls.push({ id: Date.now(), name: name, url: url, category: cat, icon: iconVal || undefined });
    saveUserLinks(uls); closeModal(); render();
  });

  document.getElementById('search').addEventListener('input', render);
  document.getElementById('search').addEventListener('keydown', function(e){
    if(e.key === 'Enter'){
      var q = this.value.trim();
      if(q) window.open(engines[engineIndex].url + encodeURIComponent(q), '_blank');
    }
  });
  // 搜索引擎：点击按钮展开下拉菜单，选引擎；输入回车按当前引擎搜索
  document.getElementById('searchBtn').addEventListener('click', function(e){
    e.stopPropagation();
    engineMenu.classList.toggle('open');
  });
  document.addEventListener('click', function(){ engineMenu.classList.remove('open'); });

  // 内外网手动切换：默认按登录网址自动判断，点图标按钮手动覆盖并实时切换
  var netToggle = document.getElementById('netToggle');
  function syncNetToggle(){
    netToggle.classList.toggle('ext', mode === 'external');
  }
  syncNetToggle();
  netToggle.addEventListener('click', function(){
    mode = (mode === 'internal') ? 'external' : 'internal';
    syncNetToggle();
    render();
  });

  // 编辑模式总开关：默认卡片无按钮，点图标才浮现 ✎/×
  var editToggle = document.getElementById('editToggle');
  editToggle.addEventListener('click', function(){
    document.body.classList.toggle('editing');
  });

  render();
})();


/* ============================================================
   GreenLine — App Engine v6
   gdtfair 布局：左侧分类侧边栏 + 右侧产品网格 · 默认英文
   ============================================================ */

(function () {
  'use strict';

  var d = GT_DATA;
  var i18n = GT_I18N;
  var lang = 'en';            // 默认语言：英文
  var activeCat = '';          // 当前选中的分类（空=全部）
  var searchQuery = '';

  /* ===== Helpers ===== */
  function t(key) {
    if (!i18n || !i18n[key]) return key;
    return i18n[key][lang] || i18n[key]['cn'] || key;
  }
  function dc(obj, key) {
    if (!obj) return '';
    var k = key + '_' + lang;
    if (obj[k] !== undefined) return obj[k];
    k = key + '_cn';
    if (obj[k] !== undefined) return obj[k];
    return obj[key] !== undefined ? obj[key] : '';
  }

  /* ===== 导航中英文映射 ===== */
  var navSections = ['products', 'about', 'service', 'testimonials', 'catalog', 'contact'];

  function updateNavText() {
    var links = document.querySelectorAll('.nav-links a');
    navSections.forEach(function (sectionId, i) {
      if (links[i]) {
        var item = null;
        for (var j = 0; j < d.nav.length; j++) {
          if (d.nav[j].id === sectionId) { item = d.nav[j]; break; }
        }
        if (item) links[i].textContent = item[lang] || dc(item, 'name');
      }
    });

    // 侧边栏推广卡文案跟随语言
    var pt = document.getElementById('promoTitle');
    var ptx = document.getElementById('promoText');
    var pb = document.getElementById('promoBtn');
    if (pt) pt.textContent = lang === 'cn' ? '需要定制报价？' : 'Need a Custom Quote?';
    if (ptx) ptx.textContent = lang === 'cn' ? '告诉我们您的需求，我们全球寻源、质检、发货。' : 'Tell us your specs — we source, inspect & ship worldwide.';
    if (pb) pb.textContent = lang === 'cn' ? '获取报价 →' : 'Get a Quote →';

    // 侧边栏浮窗文案跟随语言
    document.querySelectorAll('.cat-popup-text').forEach(function (el) {
      el.textContent = lang === 'cn' ? '观看更多目录册' : 'View More Catalogues';
    });

    // 导航栏「目录册」入口跟随语言（d.nav 数据无 catalog 项，需单独设置）
    var navCat = document.getElementById('navCatalogLink');
    if (navCat) navCat.textContent = lang === 'cn' ? '目录册' : 'Catalogues';
  }

  /* ===== Language ===== */
  function setLangBtn() {
    var lb = document.getElementById('langBtn');
    if (!lb) return;
    lb.textContent = lang === 'cn' ? 'EN' : '中文';
    lb.title = lang === 'cn' ? 'Switch to English' : '切换到中文';
  }
  function setLang(l) {
    lang = l;
    document.documentElement.lang = lang === 'cn' ? 'zh-CN' : 'en';
    setLangBtn();
    updateNavText();
    renderAll();
    resetReveals();
  }
  document.getElementById('langBtn').addEventListener('click', function () {
    setLang(lang === 'cn' ? 'en' : 'cn');
  });

  /* ===== Sidebar header click toggles collapse (keeps feature after nav Categories button removed) ===== */
  var sbHeader = document.querySelector('.sidebar-header');
  if (sbHeader) {
    sbHeader.addEventListener('click', function () {
      var sb = document.getElementById('sidebar');
      if (sb) sb.classList.toggle('cat-collapsed');
    });
  }

  /* ===== Preloader — 关键：DOM 渲染完即隐藏，不等所有图片/字体（解决“进去太慢”） ===== */
  function hidePreloader() {
    var pl = document.getElementById('preloader');
    if (!pl || pl.classList.contains('hidden')) return;
    pl.classList.add('hidden');
    setTimeout(function () { if (pl) pl.remove(); }, 500);
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { setTimeout(hidePreloader, 200); });
  } else {
    setTimeout(hidePreloader, 200);
  }
  // 兜底：即使资源卡住，1.5s 后也强制隐藏
  setTimeout(hidePreloader, 1500);
  window.addEventListener('load', hidePreloader);

  /* ===== Custom Cursor ===== */
  var cursor = document.getElementById('cursor');
  document.addEventListener('mousemove', function (e) {
    cursor.style.left = e.clientX + 'px';
    cursor.style.top = e.clientY + 'px';
  });
  document.querySelectorAll('a, button, .prod-card, .svc-card, .step, .testimonial, .sidebar-cat-item, .contact-item, .search-clear').forEach(function (el) {
    el.addEventListener('mouseenter', function () { cursor.classList.add('hover'); });
    el.addEventListener('mouseleave', function () { cursor.classList.remove('hover'); });
  });

  /* ===== Scroll Spy ===== */
  var sectionIds = ['home', 'products', 'statsSec', 'tradeBanner1', 'about', 'service', 'process', 'testimonials', 'tradeBanner2', 'partners', 'contact'];
  var sectionToNav = {
    'home': 'home',
    'products': 'products',
    'statsSec': 'products',
    'tradeBanner1': 'products',
    'about': 'about',
    'service': 'service',
    'process': 'service',
    'testimonials': 'testimonials',
    'tradeBanner2': 'testimonials',
    'partners': 'testimonials',
    'contact': 'contact'
  };

  function scrollSpy() {
    var scrollPos = window.scrollY + window.innerHeight / 3;
    var activeNav = 'home';

    for (var i = sectionIds.length - 1; i >= 0; i--) {
      var el = document.getElementById(sectionIds[i]);
      if (el && el.offsetTop <= scrollPos) {
        activeNav = sectionToNav[sectionIds[i]];
        break;
      }
    }

    var links = document.querySelectorAll('.nav-links a');
    links.forEach(function (link, idx) {
      if (idx < navSections.length) {
        link.classList.toggle('active', navSections[idx] === activeNav);
      }
    });
  }

  window.addEventListener('scroll', function () {
    scrollSpy();
  }, { passive: true });

  /* ===== Scroll Progress Bar ===== */
  var progressBar = document.getElementById('scrollProgress');
  window.addEventListener('scroll', function () {
    var scrollTop = window.scrollY;
    var docHeight = document.documentElement.scrollHeight - window.innerHeight;
    var progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    progressBar.style.width = progress + '%';
  }, { passive: true });

  /* ===== Nav shadow on scroll ===== */
  var navEl = document.getElementById('nav');
  window.addEventListener('scroll', function () {
    navEl.classList.toggle('shadowed', window.scrollY > 5);
  }, { passive: true });

  /* ===== 入场动画观察器 ===== */
  function observeReveal() {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var el = entry.target;
          if (el.classList.contains('reveal-stagger')) {
            var children = el.children;
            for (var i = 0; i < children.length; i++) {
              (function (child, idx) {
                setTimeout(function () {
                  child.classList.add('visible');
                }, Math.min(idx, 16) * 45);   // 级联封顶 ~0.7s，不随卡片数无限拉长
              })(children[i], i);
            }
          }
          el.classList.add('visible');
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('.reveal').forEach(function (el) {
      observer.observe(el);
    });
    document.querySelectorAll('.reveal-stagger').forEach(function (el) {
      observer.observe(el);
    });
  }

  function resetReveals() {
    document.querySelectorAll('.reveal, .reveal-stagger, .reveal-stagger > *').forEach(function (el) {
      el.classList.remove('visible');
    });
    requestAnimationFrame(function () { observeReveal(); });
  }

  /* ===== Counter animation ===== */
  function animateCounters() {
    document.querySelectorAll('.stats-num').forEach(function (el) {
      var final = el.getAttribute('data-final');
      if (!final || el.dataset.animated) return;
      el.dataset.animated = '1';
      var suffix = el.getAttribute('data-suffix') || '';
      var duration = 2200;
      var start = null;
      function step(ts) {
        if (!start) start = ts;
        var progress = Math.min((ts - start) / duration, 1);
        var eased = 1 - Math.pow(1 - progress, 4);
        var current = Math.floor(eased * parseFloat(final));
        el.textContent = current.toLocaleString() + suffix;
        if (progress < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    });
  }

  var statsObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        animateCounters();
        statsObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.25 });

  /* ===== Mobile menu ===== */
  var navLinksEl = document.querySelector('.nav-links');
  var navToggle = document.getElementById('navToggle');
  navToggle.addEventListener('click', function () {
    navLinksEl.classList.toggle('open');
  });
  navLinksEl.addEventListener('click', function (e) {
    if (e.target.tagName === 'A') navLinksEl.classList.remove('open');
  });

  /* ===== Back to top ===== */
  var bttBtn = document.getElementById('btt');
  window.addEventListener('scroll', function () {
    bttBtn.classList.toggle('visible', window.scrollY > 600);
  }, { passive: true });
  bttBtn.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* ===== Form ===== */
  window.handleSubmit = function (e) {
    e.preventDefault();
    alert(dc(d.contact.form, 'success'));
    e.target.reset();
    return false;
  };

  /* ==================== RENDER ==================== */
  function renderAll() {
    renderTopHeader();
    renderSidebar();
    renderProductGrid();
    renderStats();
    renderBanners();
    renderAbout();
    renderServices();
    renderProcess();
    renderTestimonials();
    renderPartners();
    renderContact();
    renderFooter();
    observeReveal();

    var strip = document.getElementById('statsStrip');
    if (strip) statsObserver.observe(strip);

    attachTopSearch();
    attachProductClick();
  }

  /* ===== Top Header（搜索栏分类下拉） ===== */
  function renderTopHeader() {
    var catSelect = document.getElementById('topSearchCat');
    if (!catSelect) return;
    catSelect.innerHTML = '<option value="">' + (lang === 'cn' ? '全部分类' : 'All Categories') + '</option>';
    d.categories.forEach(function (c) {
      var opt = document.createElement('option');
      opt.value = c.id;
      opt.textContent = dc(c, 'name');
      catSelect.appendChild(opt);
    });

    // Sidebar title
    var st = document.getElementById('sidebarTitle');
    if (st) st.textContent = lang === 'cn' ? 'Categories' : 'Categories';

    // Search placeholder
    var si = document.getElementById('topSearchInput');
    if (si) si.placeholder = lang === 'cn'
      ? '您在找什么产品？'
      : 'What are you looking for...';

    // Search button text
    var sb = document.getElementById('topSearchBtn');
    if (sb) sb.textContent = lang === 'cn' ? '搜索' : 'Search';
  }

  /* ===== 左侧分类侧边栏 ===== */
  function catPopupHtml(catId) {
    return '<span class="cat-popup" data-cat="' + catId + '">' +
             '<span class="cat-popup-icon">📖</span>' +
             '<span class="cat-popup-text">' + (lang === 'cn' ? '观看更多目录册' : 'View More Catalogues') + '</span>' +
           '</span>';
  }

  function renderSidebar() {
    var list = document.getElementById('sidebarCatList');
    if (!list) return;

    var html = '';
    // "All" option first
    html += '<li class="sidebar-cat-item' + (activeCat === '' ? ' active' : '') + '" data-cat="">';
    html += '<span class="sidebar-cat-icon">📦</span>';
    html += '<span class="sidebar-cat-name">' + (lang === 'cn' ? '全部产品' : 'All Products') + '</span>';
    html += catPopupHtml('');
    html += '</li>';

    d.categories.forEach(function (c) {
      html += '<li class="sidebar-cat-item' + (activeCat === c.id ? ' active' : '') + '" data-cat="' + c.id + '">';
      html += '<span class="sidebar-cat-icon">' + (c.icon || '•') + '</span>';
      html += '<span class="sidebar-cat-name">' + dc(c, 'name') + '</span>';
      html += catPopupHtml(c.id);
      html += '</li>';
    });
    list.innerHTML = html;

    // 绑定分类点击（筛选产品，点到浮窗不触发）
    list.querySelectorAll('.sidebar-cat-item').forEach(function (item) {
      item.addEventListener('click', function (e) {
        if (e.target.closest('.cat-popup')) return;
        activeCat = this.getAttribute('data-cat') || '';
        list.querySelectorAll('.sidebar-cat-item').forEach(function (it) {
          it.classList.remove('active');
        });
        this.classList.add('active');
        renderProductGrid();
      });
    });

    // 绑定浮窗点击（跳转目录册界面）
    list.querySelectorAll('.cat-popup').forEach(function (pop) {
      pop.addEventListener('click', function (e) {
        e.stopPropagation();
        goCatalog(this.getAttribute('data-cat') || '');
      });
    });
  }

  /* 跳转目录册选择界面：指向 catalog/（hub）。
     携带 ?cat= 栏目与 &lang= 当前语言，由 hub 按栏目过滤展示对应目录册卡片。 */
  function goCatalog(catId) {
    var CATALOG_URL = 'catalog/';
    var q = [];
    if (catId) q.push('cat=' + encodeURIComponent(catId));
    if (typeof lang !== 'undefined') q.push('lang=' + encodeURIComponent(lang));
    window.location.href = CATALOG_URL + (q.length ? ('?' + q.join('&')) : '');
  }

  /* ===== 产品卡片（复用原样式） ===== */
  function buildCard(p, idx) {
    var catObj = null;
    for (var ci = 0; ci < d.categories.length; ci++) {
      if (d.categories[ci].id === p.category) { catObj = d.categories[ci]; break; }
    }
    var catName = catObj ? dc(catObj, 'name') : '';
    var imgContent = p.image
      ? '<img src="' + p.image + '" alt="' + dc(p, 'name') + '" style="width:100%;height:100%;object-fit:cover;" loading="lazy" decoding="async">'
      : '<div class="prod-card-img-placeholder">' + (catObj ? catObj.icon || '📦' : '📦') + '</div>';
    return '' +
      '<div class="prod-card delay-' + ((idx % 6) + 1) + '" data-cat="' + p.category + '">' +
        '<div class="prod-card-img-wrap">' +
          imgContent +
          '<img class="prod-card-logo" src="assets/prod-logo-badge.png?v=1" alt="GREENLINE" loading="lazy" decoding="async">' +
          '<div class="prod-card-overlay">' +
            '<div class="prod-card-quick">' + (lang === 'cn' ? '立即询价' : 'Inquire Now') + '</div>' +
          '</div>' +
        '</div>' +
        '<div class="prod-card-body">' +
          '<span class="prod-card-cat">' + catName + '</span>' +
          '<div class="prod-card-name">' + dc(p, 'name') + '</div>' +
          '<div class="prod-card-desc">' + dc(p, 'desc') + '</div>' +
        '</div>' +
      '</div>';
  }

  /* ===== 右侧产品网格 ===== */
  function renderProductGrid() {
    var grid = document.getElementById('prodGrid');
    var heading = document.getElementById('contentHeading');
    var countEl = document.getElementById('contentCount');
    var noResult = document.getElementById('prodNoResult');
    var noResultText = document.getElementById('noResultText');
    if (!grid) return;

    // 筛选产品
    var filtered = d.products.filter(function (p) {
      var matchCat = !activeCat || p.category === activeCat;
      var matchSearch = !searchQuery;
      if (searchQuery && matchCat) {
        var text = (dc(p, 'name') + ' ' + dc(p, 'desc') + ' ' + p.category).toLowerCase();
        matchSearch = text.indexOf(searchQuery) !== -1;
      }
      return matchCat && matchSearch;
    });

    // 更新标题
    if (heading) {
      if (activeCat) {
        var catObj = null;
        for (var ci = 0; ci < d.categories.length; ci++) {
          if (d.categories[ci].id === activeCat) { catObj = d.categories[ci]; break; }
        }
        heading.textContent = catObj ? dc(catObj, 'name') : 'Products';
      } else {
        heading.textContent = lang === 'cn' ? '全部产品' : 'All Products';
      }
    }

    // 更新计数
    if (countEl) {
      countEl.innerHTML = '<strong>' + filtered.length + '</strong> ' + (lang === 'cn' ? '款产品' : 'products');
    }

    // 渲染卡片或空状态
    if (filtered.length === 0) {
      grid.innerHTML = '';
      grid.style.display = 'none';
      if (noResult) noResult.style.display = '';
      if (noResultText) noResultText.textContent = lang === 'cn' ? '未找到匹配的产品。' : 'No products found.';
    } else {
      grid.style.display = '';
      if (noResult) noResult.style.display = 'none';
      var cardsHtml = '';
      filtered.forEach(function (p, i) {
        cardsHtml += buildCard(p, i);
      });
      grid.innerHTML = cardsHtml;
      // 触发 stagger 动画
      requestAnimationFrame(function () { observeReveal(); });
    }
  }

  /* ===== 顶部搜索栏 ===== */
  function attachTopSearch() {
    var input = document.getElementById('topSearchInput');
    var btn = document.getElementById('topSearchBtn');
    var catSel = document.getElementById('topSearchCat');
    if (!input) return;

    function doSearch() {
      searchQuery = input.value.toLowerCase().trim();
      // 如果选了分类下拉，也同步到侧边栏
      if (catSel && catSel.value) {
        activeCat = catSel.value;
        // 更新侧边栏激活状态
        var items = document.querySelectorAll('.sidebar-cat-item');
        items.forEach(function (it) { it.classList.remove('active'); });
        var target = document.querySelector('.sidebar-cat-item[data-cat="' + activeCat + '"]');
        if (target) target.classList.add('active');
      }
      renderProductGrid();
    }

    input.addEventListener('input', doSearch);
    if (btn) btn.addEventListener('click', doSearch);
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') doSearch();
    });
    if (catSel) catSel.addEventListener('change', doSearch);
  }

  /* ===== 产品卡片点击 → 滚动到联系区域 ===== */
  function attachProductClick() {
    var grid = document.getElementById('prodGrid');
    if (!grid) return;
    grid.addEventListener('click', function (e) {
      var card = e.target.closest('.prod-card');
      if (card) {
        document.getElementById('contact').scrollIntoView({ behavior: 'smooth' });
      }
    });
  }

  function renderStats() {
    var html = '';
    d.stats.forEach(function (s) {
      html +=
        '<div class="stats-item">' +
          '<div class="stats-num" data-final="' + s.value.replace(/[,+]/g, '') + '" data-suffix="' + s.suffix + '">' + s.value + '</div>' +
          '<div class="stats-lbl">' + dc(s, 'label') + '</div>' +
        '</div>';
    });
    document.getElementById('statsStrip').innerHTML = html;
  }

  function renderBanners() {
    var b1t = document.getElementById('bannerTitle');
    var b1s = document.getElementById('bannerSub');
    var b2t = document.getElementById('banner2Title');
    var b2s = document.getElementById('banner2Sub');
    if (b1t) b1t.textContent = dc(d.banners ? d.banners[0] : null, 'title') || (lang === 'cn' ? '全球物流 · 直达交付' : 'Global Logistics · Direct Delivery');
    if (b1s) b1s.textContent = dc(d.banners ? d.banners[0] : null, 'sub') || (lang === 'cn' ? '海运、空运、铁路多式联运，DDP 门到门服务' : 'Sea, air, rail multimodal transport, DDP door-to-door');
    if (b2t) b2t.textContent = dc(d.banners ? d.banners[1] : null, 'title') || (lang === 'cn' ? '品质管控 · 全程可追溯' : 'Quality Control · Fully Traceable');
    if (b2s) b2s.textContent = dc(d.banners ? d.banners[1] : null, 'sub') || (lang === 'cn' ? 'SGS/BV 第三方验货，AQL 国际抽检标准' : 'SGS/BV third-party inspection, AQL international standards');
  }

  function renderAbout() {
    document.getElementById('aboutLabel').textContent = dc(d.about, 'label');
    document.getElementById('aboutHeading').innerHTML = dc(d.about, 'heading').replace(/\n/g, '<br>');
    document.getElementById('aboutP1').textContent = dc(d.about, 'p1');
    document.getElementById('aboutP2').textContent = dc(d.about, 'p2');
    document.getElementById('aboutBadgeVal').textContent = d.about.badge_val;
    document.getElementById('aboutBadgeLbl').textContent = dc(d.about, 'badge_lbl');

    var aboutImg = document.getElementById('aboutImg');
    if (d.about.image && aboutImg) {
      aboutImg.innerHTML = '<img src="' + d.about.image + '" alt="' + dc(d.about, 'label') + '" style="width:100%;height:100%;object-fit:cover;border-radius:var(--radius-xl)">';
    }

    var ctaBtn = document.getElementById('aboutCta');
    ctaBtn.textContent = dc(d.about, 'cta');
    ctaBtn.href = '#contact';

    var ch = '';
    d.about.checks.forEach(function (c) {
      ch += '<div class="about-check"><span class="about-check-icon">✓</span>' + dc(c, '') + '</div>';
    });
    document.getElementById('aboutChecks').innerHTML = ch;
  }

  function renderServices() {
    document.getElementById('serviceLabel').textContent = dc(d.services, 'label');
    document.getElementById('serviceTitle').textContent = dc(d.services, 'title');
    document.getElementById('serviceSubtitle').textContent = dc(d.services, 'subtitle');

    var html = '';
    d.services.items.forEach(function (s, idx) {
      html +=
        '<div class="svc-card delay-' + ((idx % 6) + 1) + '">' +
          '<span class="svc-num">0' + (idx + 1) + '</span>' +
          '<div class="svc-icon">' + s.icon + '</div>' +
          '<div class="svc-title">' + dc(s, 'title') + '</div>' +
          '<div class="svc-desc">' + dc(s, 'desc') + '</div>' +
        '</div>';
    });
    document.getElementById('svcGrid').innerHTML = html;
  }

  function renderProcess() {
    document.getElementById('processLabel').textContent = dc(d.process, 'label');
    document.getElementById('processTitle').textContent = dc(d.process, 'title');
    document.getElementById('processSubtitle').textContent = dc(d.process, 'subtitle');

    var html = '';
    d.process.steps.forEach(function (s, idx) {
      html +=
        '<div class="step delay-' + ((idx % 5) + 1) + '">' +
          '<div class="step-num">' + s.num + '</div>' +
          '<div class="step-title">' + dc(s, 'title') + '</div>' +
          '<div class="step-desc">' + dc(s, 'desc') + '</div>' +
        '</div>';
    });
    document.getElementById('stepsRow').innerHTML = html;
  }

  function renderTestimonials() {
    document.getElementById('testLabel').textContent = dc(d.testimonials, 'label');
    document.getElementById('testTitle').textContent = dc(d.testimonials, 'title');

    var html = '';
    d.testimonials.items.forEach(function (t, idx) {
      html +=
        '<div class="testimonial delay-' + ((idx % 3) + 1) + '">' +
          '<div class="testimonial-stars">' + '★'.repeat(t.stars) + '</div>' +
          '<div class="testimonial-text">"' + dc(t, 'text') + '"</div>' +
          '<div class="testimonial-author">' +
            '<div class="testimonial-avatar">' + t.initial + '</div>' +
            '<div>' +
              '<div class="testimonial-name">' + t.name + '</div>' +
              '<div class="testimonial-role">' + dc(t, 'role') + '</div>' +
            '</div>' +
          '</div>' +
        '</div>';
    });
    document.getElementById('testGrid').innerHTML = html;
  }

  function renderPartners() {
    document.getElementById('partnersLabel').textContent = dc(d.partners, 'label');
    document.getElementById('partnersTitle').textContent = dc(d.partners, 'title');

    var track = document.getElementById('partnersTrack');
    var names = d.partners.names;
    var doubled = names.concat(names);
    var html = '';
    doubled.forEach(function (n) {
      html += '<span class="partner-item">' + n + '</span>';
    });
    track.innerHTML = html;
  }

  function renderContact() {
    document.getElementById('contactLabel').textContent = dc(d.contact, 'label');
    document.getElementById('contactTitle').textContent = dc(d.contact, 'title');
    document.getElementById('contactSubtitle').textContent = dc(d.contact, 'subtitle');

    var infoHtml = '<h3>' + (lang === 'cn' ? '联系方式' : 'Get in Touch') + '</h3>';
    d.contact.info_items.forEach(function (item) {
      infoHtml +=
        '<div class="contact-item">' +
          '<div class="contact-item-icon">' + item.icon + '</div>' +
          '<div class="contact-item-body">' +
            '<strong>' + dc(item, 'label') + '</strong>' +
            '<span>' + dc(item, 'value') + '</span>' +
          '</div>' +
        '</div>';
    });
    document.getElementById('contactInfo').innerHTML = infoHtml;
  }

  function renderFooter() {
    var f = d.footer;
    var fhtml = '';
    fhtml += '<div class="footer-col"><h4>GREENLINE</h4><p style="line-height:1.7">' + dc(f, 'about') + '</p></div>';

    fhtml += '<div class="footer-col"><h4>' + dc(f, 'quick_links') + '</h4>';
    d.nav.forEach(function (n) {
      fhtml += '<a href="#' + n.id + '">' + dc(n, '') + '</a>';
    });
    fhtml += '</div>';

    fhtml += '<div class="footer-col"><h4>' + dc(f, 'categories') + '</h4>';
    d.categories.forEach(function (c) {
      fhtml += '<a href="#cat-' + c.id + '">' + dc(c, 'name') + '</a>';
    });
    fhtml += '</div>';

    fhtml += '<div class="footer-col"><h4>' + dc(f, 'contact') + '</h4>';
    fhtml += '<p>' + d.company.email + '</p><p>' + d.company.phone + '</p><p style="white-space:pre-line">' + dc(d.company, 'address') + '</p>';
    fhtml += '</div>';
    document.getElementById('footerGrid').innerHTML = fhtml;

    document.getElementById('footerCopy').textContent = dc(f, 'copy');
  }

  /* ===== Init ===== */
  renderAll();
  updateNavText();
  setLangBtn();
  scrollSpy();

  // 顶部导航「Catalogues」入口：带当前语言跳转目录册 hub
  var navCat = document.getElementById('navCatalogLink');
  if (navCat) navCat.addEventListener('click', function (e) { e.preventDefault(); goCatalog(''); });
})();

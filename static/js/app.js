// ==============================
    //  商品数据（从后端API加载）
    // ==============================
    var products = [];

    // 从后端加载商品数据
    function loadProducts() {
      var api = window.API_BASE || '';
      fetch(api + '/api/products')
        .then(function(r){return r.json()})
        .then(function(d){
          if (d.code !== 0) return;
          products = d.data;
          // 重新渲染
          allCategories = products
            .map(function(p){return p.category1})
            .filter(function(c,i,a){return a.indexOf(c)===i})
            .sort();
          renderCategories();
          applyFilters();
        })
        .catch(function(){
          // API不可用时使用空数组
          products = [];
          renderCategories();
          applyFilters();
        });
    }

    // ==============================
    //  分类Emoji + 颜色块颜色映射
    // ==============================
    var categoryIcons = {
      '智能穿戴':'👁️','家电厨电':'🍳','出行交通':'🚀','数字服务':'💠',
      '家居生活':'🏠','户外运动':'🏔️','个护健康':'💎','服装':'🧥',
      '机器人':'🤖','食品酒饮':'🍷','家居园艺':'🌱','数码配件':'🔋',
      '数码存储':'💾','医疗健康':'💊','影音娱乐':'🎬','玩具':'🧩',
      '数码通讯':'📱','出行配件':'🔧','摄影器材':'📷'
    };
    var categoryColors = {
      '智能穿戴':'#7c3aed','家电厨业':'#059669','家电厨电':'#059669','出行交通':'#0891b2',
      '数字服务':'#6366f1','家居生活':'#0d9488','户外运动':'#d97706','个护健康':'#db2777',
      '服装':'#2563eb','机器人':'#7c3aed','食品酒饮':'#b91c1c','家居园艺':'#16a34a',
      '数码配件':'#1d4ed8','数码存储':'#4338ca','医疗健康':'#059669','影音娱乐':'#9333ea',
      '玩具':'#ea580c','数码通讯':'#2563eb','出行配件':'#52525b','摄影器材':'#0d9488'
    };
    function colorForCategory(c) { return categoryColors[c] || '#6366f1'; }

    // ==============================
    //  分类提取
    // ==============================
    var allCategories = [];

    // ==============================
    //  状态
    // ==============================
    var currentCategory = 'all';
    var currentSearch = '';
    var currentSort = '';
    var currentProductId = null;

    // ==============================
    //  通用函数
    // ==============================
    function formatPrice(p) {
      if (typeof p === 'string') return p;
      return p.toLocaleString();
    }
    function isNumericPrice(p) { return typeof p === 'number'; }

    // ==============================
    //  分类按钮
    // ==============================

    function renderCategories() {
      var c = document.getElementById('categoryFilter');
      var h = '';
      var allCount = products.length;
      h += '<div class="cat-item active" data-cat="all"><span class="icon">✦</span><span class="label">全部</span><span class="count">'+allCount+'</span></div>';
      for (var i = 0; i < allCategories.length; i++) {
        var icon = categoryIcons[allCategories[i]] || '✦';
        var count = products.filter(function(p){return p.category1===allCategories[i];}).length;
        h += '<div class="cat-item" data-cat="'+allCategories[i]+'"><span class="icon">'+icon+'</span><span class="label">'+allCategories[i]+'</span><span class="count">'+count+'</span></div>';
      }
      c.innerHTML = h;
      c.addEventListener('click', function(e) {
        var item = e.target.closest('.cat-item');
        if (!item) return;
        var active = c.querySelector('.cat-item.active');
        if (active) active.classList.remove('active');
        item.classList.add('active');
        currentCategory = item.dataset.cat;
        applyFilters();
      });
    }

    // ==============================
    //  搜索 & 排序
    // ==============================
    function onSearchChange() {
      currentSearch = document.getElementById('searchBox').value.trim().toLowerCase();
      applyFilters();
    }
    var sortAsc = false;
    function toggleSort() {
      sortAsc = !sortAsc;
      currentSort = sortAsc ? 'asc' : 'desc';
      document.getElementById('sortPrice').textContent = '价格 ' + (sortAsc ? '▴' : '▾');
      applyFilters();
    }

    // ==============================
    //  过滤 + 渲染
    // ==============================
    function applyFilters() {
      renderProducts(currentCategory, currentSearch, currentSort);
    }

    function renderProducts(category, search, sort) {
      var grid = document.getElementById('productGrid');
      var skeleton = document.getElementById('skeletonGrid');
      skeleton.style.display = '';
      grid.style.display = 'none';

      setTimeout(function() {
        // 分类过滤
        var filtered = category === 'all'
          ? products.slice()
          : products.filter(function(p){return p.category1 === category;});

        // 搜索过滤
        if (search) {
          filtered = filtered.filter(function(p) {
            return p.name.toLowerCase().indexOf(search) !== -1 ||
                   p.brand.toLowerCase().indexOf(search) !== -1;
          });
        }

        // 排序
        if (sort) {
          filtered.sort(function(a,b) {
            var pa = isNumericPrice(a.price) ? a.price : (typeof a.price === 'string' ? parseFloat(a.price) : 9999999);
            var pb = isNumericPrice(b.price) ? b.price : (typeof b.price === 'string' ? parseFloat(b.price) : 9999999);
            return sort === 'asc' ? pa - pb : pb - pa;
          });
        }

        // 统计
        document.getElementById('statsText').textContent = '共 '+products.length+' 件 · 当前 '+filtered.length+' 件';

        if (filtered.length === 0) {
          grid.innerHTML = '<div class="empty-state"><div class="text-4xl mb-3 opacity-30">✦</div><p class="text-sm">没有找到匹配的商品</p></div>';
        } else {
          var html = '';
          for (var i = 0; i < filtered.length; i++) {
            var p = filtered[i];
            var cc = colorForCategory(p.category1);
            var icon = categoryIcons[p.category1] || '✦';
            // 角落标签：新品/热卖
            var cornerTag = '';
            var launchDate = p.launch;
            if (launchDate && launchDate.indexOf('待定') === -1 && launchDate.indexOf('2042-') === 0) {
              var month = parseInt(launchDate.split('-')[1], 10);
              if (month >= 3) cornerTag = '<span class="corner-tag" style="background:'+cc+'33;color:'+cc+'">🆕 新品</span>';
            }
            if (!cornerTag && p.stock === '限量') cornerTag = '<span class="corner-tag" style="background:rgba(255,80,80,0.15);color:#ff5050">🔥 热卖</span>';

            html +=
              '<div class="product-card" data-id="'+p.id+'" style="animation-delay:'+(i*0.035)+'s">'+
                '<div class="card-accent"></div>'+
                cornerTag+
                '<div class="card-accent-line" style="--accent-color:'+cc+'"></div>'+
                '<div class="p-4 md:p-5" style="display:flex;flex-direction:column;min-height:180px;">'+
                  '<div class="flex items-center justify-between mb-2">'+
                    '<span class="text-[10px] text-cyan-500/50 uppercase tracking-wider">'+icon+' '+p.category1+'</span>'+
                    '<span class="stock-tag '+(stockClassMap[p.stock]||'stock-spot')+'">'+p.stock+'</span>'+
                  '</div>'+
                  '<h3 class="text-base md:text-lg font-bold text-white leading-snug mb-1">'+p.name+'</h3>'+
                  '<p class="text-xs text-gray-500 mb-1">'+p.brand+'</p>'+
                  '<p class="text-xs text-gray-600 leading-relaxed" style="flex:1;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;">'+p.desc+'</p>'+
                  '<div class="flex items-center justify-between gap-1 pt-2" style="min-height:34px;">'+
                    '<div class="flex items-end gap-1" style="flex:1;min-width:0;">'+
                      '<span class="text-lg font-bold text-cyan-300 whitespace-nowrap">'+formatPrice(p.price)+'</span>'+
                      (typeof p.price === 'string' && p.price.indexOf('/') !== -1
                        ? '<span class="text-[10px] text-purple-400/70 whitespace-nowrap" style="line-height:1.6rem;">订阅</span>'
                        : '<span class="text-[10px] text-gray-500 whitespace-nowrap" style="line-height:1.6rem;">信用点</span>')+
                    '</div>'+
                    '<div class="flex items-center gap-1 flex-shrink-0">'+
                      '<button class="cart-add-btn text-xs text-cyan-400/60 hover:text-cyan-300 border border-cyan-500/20 hover:border-cyan-400/40 rounded-lg px-2 py-1.5 transition-all whitespace-nowrap" data-id="'+p.id+'">加入购物车</button>'+
                      '<button class="buy-btn text-xs text-purple-400/60 hover:text-purple-300 border border-purple-500/20 hover:border-purple-400/40 rounded-lg px-2 py-1.5 transition-all whitespace-nowrap" data-id="'+p.id+'">购买</button>'+
                    '</div>'+
                  '</div>'+
                '</div>'+
              '</div>';
          }
          grid.innerHTML = html;

          // 入场动画
          var cards = grid.querySelectorAll('.product-card');
          for (var k = 0; k < cards.length; k++) {
            (function(c){setTimeout(function(){c.classList.add('animate-in');},10);})(cards[k]);
          }

          // 卡片点击
          for (var m = 0; m < cards.length; m++) {
            cards[m].addEventListener('click', function(e) {
              if (e.target.classList.contains('cart-add-btn') || e.target.closest('.cart-add-btn') || e.target.classList.contains('buy-btn') || e.target.closest('.buy-btn')) return;
              if (e.target.closest('.product-card')) openModal(this.dataset.id);
            });
          }

          // 加购按钮
          var btns = grid.querySelectorAll('.cart-add-btn');
          for (var n = 0; n < btns.length; n++) {
            btns[n].addEventListener('click', function(e) {
              e.stopPropagation();
              addToCart(this.dataset.id);
            });
          }
          // 购买按钮
          var buyBtns = grid.querySelectorAll('.buy-btn');
          for (var o = 0; o < buyBtns.length; o++) {
            buyBtns[o].addEventListener('click', function(e) {
              e.stopPropagation();
              buyNow(this.dataset.id);
            });
          }
        }

        skeleton.style.display = 'none';
        grid.style.display = '';
      }, 200);
    }

    // ==============================
    //  购物车（localStorage持久化）
    // ==============================
    var cart = loadCart();

    // ---------- 存储工具 ----------
    function lsGet(key, def) { try { return JSON.parse(localStorage.getItem(key)) || def; } catch(e) { return def || {}; } }
    function lsSet(key, val) { try { localStorage.setItem(key, JSON.stringify(val)); } catch(e) {} }

    function loadCart() { return lsGet('cart2042', {}); }
    function saveCart() { lsSet('cart2042', cart); }

    function addToCart(id, qty) {
      if (!requireAuth()) return;
      if (!qty) qty = 1;
      var p = products.find(function(item){return item.id===id;});
      if (!p) return;
      if (!cart[id]) cart[id] = {id:p.id, name:p.name, brand:p.brand, price:p.price, qty:0};
      cart[id].qty += qty;
      saveCart();
      updateCartUI();
      showToast('✓ '+p.name+' ×'+qty+' 已加入购物车');
    }
    var buyProductId = null;
    var buyModalQty = 1;
    function buyNow(id) {
      if (!requireAuth()) return;
      var p = products.find(function(item){return item.id===id;});
      if (!p) return;
      buyProductId = id;
      buyModalQty = 1;
      document.getElementById('buyModalName').textContent = p.name;
      document.getElementById('buyModalBrand').textContent = p.brand;
      document.getElementById('buyModalPrice').textContent = formatPrice(p.price) + (typeof p.price === 'number' ? ' 信用点' : '');
      document.getElementById('buyModalQty').textContent = '1';
      var price = typeof p.price === 'number' ? p.price : 0;
      document.getElementById('buyModalTotal').textContent = formatPrice(price) + ' 信用点';
      document.getElementById('buyModal').classList.add('show');
      document.body.style.overflow = 'hidden';
    }
    function changeBuyQty(delta) {
      buyModalQty = Math.max(1, buyModalQty + delta);
      document.getElementById('buyModalQty').textContent = buyModalQty;
      var p = products.find(function(item){return item.id===buyProductId;});
      if (p && typeof p.price === 'number') {
        document.getElementById('buyModalTotal').textContent = formatPrice(p.price * buyModalQty) + ' 信用点';
      }
    }
    function confirmBuy() {
      if (!buyProductId) return;
      addToCart(buyProductId, buyModalQty);
      closeBuyModal();
      checkout();
    }
    function closeBuyModal() {
      document.getElementById('buyModal').classList.remove('show');
      document.body.style.overflow = '';
    }
    function removeFromCart(id) {
      delete cart[id];
      saveCart();
      updateCartUI();
    }
    function changeQty(id, delta) {
      if (!cart[id]) return;
      cart[id].qty += delta;
      if (cart[id].qty <= 0) { delete cart[id]; }
      saveCart();
      updateCartUI();
    }
    function clearCart() {
      if (Object.keys(cart).length === 0) return;
      cart = {};
      saveCart();
      updateCartUI();
      showToast('🗑️ 购物车已清空');
    }

    // 弹窗数量选择
    var modalQty = 1;
    function getModalQty() { return modalQty; }
    function changeModalQty(delta) {
      modalQty = Math.max(1, modalQty + delta);
      document.getElementById('modalQty').textContent = modalQty;
    }
    function resetModalQty() { modalQty = 1; document.getElementById('modalQty').textContent = '1'; }

    function updateCartUI() {
      var ids = Object.keys(cart);
      var totalCount = 0, totalPrice = 0;
      for (var i = 0; i < ids.length; i++) {
        totalCount += cart[ids[i]].qty;
        if (typeof cart[ids[i]].price === 'number') totalPrice += cart[ids[i]].price * cart[ids[i]].qty;
      }

      // 角标
      var badge = document.getElementById('cartBadge');
      var bnBadge = document.getElementById('bnBadge');
      if (totalCount > 0) {
        var t = totalCount > 99 ? '99+' : totalCount;
        badge.textContent = t; badge.classList.remove('hidden');
        if (bnBadge) { bnBadge.textContent = t; bnBadge.style.display = ''; }
      } else {
        badge.classList.add('hidden');
        if (bnBadge) bnBadge.style.display = 'none';
      }

      // 清空按钮
      document.getElementById('clearCartBtn').style.display = ids.length > 0 ? '' : 'none';

      var list = document.getElementById('cartList');
      var empty = document.getElementById('cartEmpty');
      var footer = document.getElementById('cartFooter');
      if (ids.length === 0) {
        empty.style.display = '';
        list.innerHTML = '';
        footer.classList.add('hidden');
        return;
      }
      empty.style.display = 'none';
      footer.classList.remove('hidden');

      var html = '';
      for (var j = 0; j < ids.length; j++) {
        var item = cart[ids[j]];
        html +=
          '<div class="cart-item">'+
            '<div class="cart-item-info">'+
              '<div class="cart-item-name">'+item.name+'</div>'+
              '<div class="cart-item-brand">'+item.brand+'</div>'+
              '<div class="cart-item-bottom">'+
                '<span class="cart-item-price">'+formatPrice(item.price)+'</span>'+
                '<div class="cart-item-qty">'+
                  '<button onclick="changeQty(\''+item.id+'\',-1)">−</button>'+
                  '<span>'+item.qty+'</span>'+
                  '<button onclick="changeQty(\''+item.id+'\',1)">+</button>'+
                '</div>'+
              '</div>'+
            '</div>'+
            '<div class="cart-item-remove" onclick="removeFromCart(\''+item.id+'\')">✕</div>'+
          '</div>';
      }
      list.innerHTML = html;
      document.getElementById('cartTotal').textContent = totalPrice ? totalPrice.toLocaleString()+' 信用点' : '';
    }

    function toggleCart() {
      document.getElementById('cartOverlay').classList.toggle('open');
      document.getElementById('cartPanel').classList.toggle('open');
      document.body.style.overflow = document.getElementById('cartPanel').classList.contains('open') ? 'hidden' : '';
    }

    // ===== 结算弹窗 =====
    function checkout() {
      if (!requireAuth()) return;
      var ids = Object.keys(cart);
      if (ids.length === 0) { showToast('🛒 购物车是空的'); return; }

      // 调后端 API 下单
      var api = window.API_BASE || '';
      var sess = getSession();
      var token = sess.loggedIn ? sess.token : '';
      if (!token) { showToast('🔒 登录信息失效，请重新登录'); return; }

      var items = [];
      for (var i = 0; i < ids.length; i++) {
        var item = cart[ids[i]];
        items.push({ product_id: item.id, qty: item.qty, price: item.price });
      }

      fetch(api + '/api/orders?token=' + encodeURIComponent(token), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: items })
      })
      .then(function(r){ return r.json(); })
      .then(function(d){
        if (d.code !== 0) { showToast('❌ 下单失败：' + (d.detail || '未知错误')); return; }

        // 显示成功弹窗
        var orderId = d.data.order_id;
        var total = d.data.total_price;
        var summary = document.getElementById('checkoutSummary');
        var html = '';
        for (var i = 0; i < ids.length; i++) {
          var item = cart[ids[i]];
          var price = typeof item.price === 'number' ? item.price : 0;
          var sub = price * item.qty;
          html += '<div class="flex justify-between text-gray-300"><span>'+item.name+' ×'+item.qty+'</span><span class="text-cyan-300">'+(sub.toLocaleString())+' 信用点</span></div>';
        }
        html += '<div class="border-t border-cyan-500/10 pt-2 mt-2 flex justify-between text-white font-bold"><span>合计</span><span class="text-cyan-300">'+total.toLocaleString()+' 信用点</span></div>';
        summary.innerHTML = html;
        document.getElementById('checkoutOrderId').textContent = orderId;
        toggleCart();
        document.getElementById('checkoutModal').classList.add('show');
        document.body.style.overflow = 'hidden';
      })
      .catch(function(){
        showToast('❌ 网络异常，下单失败');
      });
    }
    function closeCheckout() {
      document.getElementById('checkoutModal').classList.remove('show');
      document.body.style.overflow = '';
      cart = {}; saveCart(); updateCartUI();
    }

    // ===== Toast =====
    function showToast(msg) {
      var t = document.getElementById('cartToast');
      t.textContent = msg;
      t.classList.add('show');
      if (window.tt) clearTimeout(window.tt);
      window.tt = setTimeout(function(){t.classList.remove('show');}, 2000);
    }

    // ==============================
    //  弹窗
    // ==============================
    function openModal(id) {
      var p = products.find(function(item){return item.id===id;});
      if (!p) return;
      currentProductId = id;
      resetModalQty();

      document.getElementById('modalBrand').textContent = p.brand;
      document.getElementById('modalName').textContent = p.name;
      var icon = categoryIcons[p.category1] || '✦';
      document.getElementById('modalCategory').textContent = icon+' '+p.category1;
      document.getElementById('modalSpec').textContent = p.spec;
      document.getElementById('modalColor').textContent = p.color;
      document.getElementById('modalDesc').textContent = p.desc;
      document.getElementById('modalId').textContent = '#'+p.id;

      // 价格单位：订阅商品不显示"信用点"
      var unitEl = document.getElementById('modalPriceUnit');
      if (typeof p.price === 'string' && p.price.indexOf('/') !== -1) {
        unitEl.textContent = '';
      } else {
        unitEl.textContent = '信用点';
      }

      var pc = document.getElementById('modalParamsContainer');
      var pairs = p.params.split(',');
      var ph = '';
      for (var i = 0; i < pairs.length; i++) {
        var kv = pairs[i].split(':');
        if (kv.length === 2) { ph += '<div class="param-row"><span class="param-key">'+kv[0].trim()+'</span><span class="param-val">'+kv[1].trim()+'</span></div>'; }
        else { ph += '<p class="text-gray-300 text-sm leading-relaxed">'+p.params+'</p>'; break; }
      }
      pc.innerHTML = ph;

      document.getElementById('modalPrice').textContent = formatPrice(p.price);
      document.getElementById('modalLaunch').textContent = p.launch && p.launch.indexOf('待定')===-1 ? '上线：'+p.launch : '';
      var se = document.getElementById('modalStock');
      se.textContent = p.stock;
      se.className = 'stock-tag '+(stockClassMap[p.stock]||'stock-spot');

      document.getElementById('detailModal').classList.add('show');
      document.body.style.overflow = 'hidden';
    }
    function closeModal() {
      document.getElementById('detailModal').classList.remove('show');
      document.body.style.overflow = '';
    }
    document.getElementById('detailModal').addEventListener('click', function(e){if(e.target===this) closeModal();});
    document.addEventListener('keydown', function(e){if(e.key==='Escape') closeModal();});

    // ==============================
    //  回到顶部
    // ==============================
    window.addEventListener('scroll', function() {
      var btn = document.getElementById('backTop');
      if (window.scrollY > 400) btn.classList.add('show');
      else btn.classList.remove('show');
    });

    // ==============================
    //  卡片鼠标跟随光效
    // ==============================
    document.addEventListener('mousemove', function(e) {
      var cards = document.querySelectorAll('.product-card');
      for (var i = 0; i < cards.length; i++) {
        var r = cards[i].getBoundingClientRect();
        cards[i].style.setProperty('--mx', ((e.clientX-r.left)/r.width*100)+'%');
        cards[i].style.setProperty('--my', ((e.clientY-r.top)/r.height*100)+'%');
      }
    });

    // ==============================
    //  库存标签映射
    // ==============================
    var stockClassMap = {'现货':'stock-spot','预约':'stock-book','限量':'stock-limited','预售':'stock-presale','即将上线':'stock-coming'};

    // ==============================
    //  科幻时钟（基于当前系统时间，）
    // ==============================
    function updateClock() {
      var now = new Date();
      var y = now.getFullYear();
      var mo = String(now.getMonth()+1).padStart(2,'0');
      var d = String(now.getDate()).padStart(2,'0');
      var h = String(now.getHours()).padStart(2,'0');
      var mi = String(now.getMinutes()).padStart(2,'0');
      var s = String(now.getSeconds()).padStart(2,'0');
      var el = document.getElementById('clockDisplay');
      if (el) el.textContent = y+'-'+mo+'-'+d+' '+h+':'+mi+':'+s+' CST';
    }
    updateClock();
    setInterval(updateClock, 1000);

    // ==============================
    //  登录 & 注册 & 欢迎弹窗
    // ==============================
    var DEFAULT_PASS = '2042';
    var currentUser = null;

    // ---------- 会话管理 ----------
    function getSession() { return lsGet('login2042_session', {}); }
    function saveSession(s) { lsSet('login2042_session', s); }
    function clearSession() {
      localStorage.removeItem('login2042_session');
    }

    // ---------- 导航栏 ----------
    function updateNavUser() {
      var userArea = document.getElementById('userArea');
      var userNameEl = document.getElementById('userNameDisplay');
      var loginBtn = document.getElementById('loginNavBtn');
      if (currentUser) {
        userArea.classList.remove('hidden');
        userNameEl.textContent = '👤 ' + currentUser;
        loginBtn.classList.add('hidden');
      } else {
        userArea.classList.add('hidden');
        loginBtn.classList.remove('hidden');
      }
    }

      function showLoginPage() {
      document.getElementById('registerOverlay').style.display = 'none';
      document.getElementById('loginOverlay').classList.remove('hidden');
      showingLogin = true;
    }
    function showRegisterPage() {
      document.getElementById('loginOverlay').classList.add('hidden');
      document.getElementById('registerOverlay').style.display = '';
      showingLogin = true;
    }
    function switchUser() {
      clearSession();
      currentUser = null;
      updateNavUser();
      showLoginPage();
      showToast('👋 已切换用户');
    }

    function loadLoginInfo() {
      try {
        var sess = getSession();
        if (sess.loggedIn && sess.username) {
          document.getElementById('loginOverlay').classList.add('hidden');
          document.getElementById('registerOverlay').style.display = 'none';
          currentUser = sess.username;
            } else if (sess.remember && sess.username) {
          document.getElementById('loginUser').value = sess.username || '';
          document.getElementById('loginPass').value = sess.password || '';
          document.getElementById('loginRemember').checked = true;
        }
      } catch(e) {}
      updateNavUser();
    }

    // ---------- 登录 ----------
    function doLogin() {
      var user = document.getElementById('loginUser').value.trim();
      var pass = document.getElementById('loginPass').value;
      if (!user) { shakeInput('loginUser'); return; }
      if (!pass) { shakeInput('loginPass'); return; }

      var api = window.API_BASE || '';
      fetch(api + '/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: user, password: pass })
      })
      .then(function(r){ return r.json(); })
      .then(function(d){
        if (d.code !== 0) { shakeInput('loginPass'); showToast('❌ ' + (d.detail || '登录失败')); return; }
        var remember = document.getElementById('loginRemember').checked;
        saveSession({ username: user, password: pass, token: d.data.token, remember: remember, loggedIn: true });
        currentUser = user;
        updateNavUser();
        document.getElementById('loginOverlay').classList.add('hidden');
        document.getElementById('welcomeTitle').textContent = '🚀 欢迎 ' + user + '！';
        document.getElementById('welcomeOverlay').classList.add('show');
      })
      .catch(function(){ showToast('❌ 网络异常，请检查后端是否启动'); });
    }

    // ---------- 注册 ----------
    function doRegister() {
      var user = document.getElementById('regUser').value.trim();
      var pass = document.getElementById('regPass').value;
      var pass2 = document.getElementById('regPass2').value;
      if (!user) { shakeInput('regUser'); return; }
      if (!pass) { shakeInput('regPass'); return; }
      if (pass !== pass2) { shakeInput('regPass2'); showToast('❌ 两次密码不一致'); return; }
      if (pass.length < 3) { shakeInput('regPass'); showToast('❌ 密码至少3位'); return; }

      var api = window.API_BASE || '';
      fetch(api + '/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: user, password: pass })
      })
      .then(function(r){ return r.json(); })
      .then(function(d){
        if (d.code !== 0) { shakeInput('regUser'); showToast('❌ ' + (d.detail || '注册失败')); return; }
        saveSession({ username: user, password: pass, token: d.data.token, remember: true, loggedIn: true });
        currentUser = user;
        updateNavUser();
        document.getElementById('registerOverlay').style.display = 'none';
        document.getElementById('welcomeTitle').textContent = '🎉 欢迎 ' + user + '，注册成功！';
        document.getElementById('welcomeOverlay').classList.add('show');
      })
      .catch(function(){ showToast('❌ 网络异常，请检查后端是否启动'); });
    }

    // ---------- 跳过 ----------
    function skipLogin() {
      currentUser = null;
      updateNavUser();
      document.getElementById('loginOverlay').classList.add('hidden');
      document.getElementById('welcomeTitle').textContent = '👋 欢迎来到小饶的虚拟科技百货';
      document.getElementById('welcomeOverlay').classList.add('show');
    }

    function closeWelcome() {
      document.getElementById('welcomeOverlay').classList.remove('show');
    }

    function requireAuth() {
      if (!currentUser) {
        showToast('🔒 请先登录');
        showLoginPage();
        return false;
      }
      return true;
    }

    function shakeInput(id) {
      var el = document.getElementById(id);
      el.style.borderColor = 'rgba(255,80,80,0.5)';
      el.style.animation = 'none';
      el.offsetHeight;
      el.style.animation = 'shake 0.3s ease';
      setTimeout(function(){ el.style.borderColor = ''; el.style.animation = ''; }, 500);
    }

    // ==============================
    //  初始化
    // ==============================
    loadLoginInfo();
    updateCartUI();
    loadProducts();
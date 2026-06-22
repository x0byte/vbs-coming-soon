const prototypeRoot = document.querySelector('[data-prototype]');

if (prototypeRoot) {
  const tabs = [...prototypeRoot.querySelectorAll('[role="tab"]')];
  const panels = [...prototypeRoot.querySelectorAll('[role="tabpanel"]')];

  function activatePanel(tab) {
    tabs.forEach((item) => {
      const active = item === tab;
      item.classList.toggle('is-active', active);
      item.setAttribute('aria-selected', String(active));
      item.tabIndex = active ? 0 : -1;
    });
    panels.forEach((panel) => { panel.hidden = panel.id !== tab.dataset.panel; });
  }

  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => activatePanel(tab));
    tab.addEventListener('keydown', (event) => {
      if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
      event.preventDefault();
      const offset = event.key === 'ArrowRight' ? 1 : -1;
      const next = tabs[(index + offset + tabs.length) % tabs.length];
      activatePanel(next);
      next.focus();
    });
  });

  const products = [
    { id: 1, name: 'Volt Espresso', category: 'Drinks', price: 650, icon: '☕' },
    { id: 2, name: 'Iced Matcha', category: 'Drinks', price: 850, icon: '🍵' },
    { id: 3, name: 'Mango Cooler', category: 'Drinks', price: 780, icon: '🥭' },
    { id: 4, name: 'Chicken Wrap', category: 'Food', price: 1250, icon: '🌯' },
    { id: 5, name: 'Avocado Toast', category: 'Food', price: 1400, icon: '🥑' },
    { id: 6, name: 'Power Bowl', category: 'Food', price: 1650, icon: '🥗' },
    { id: 7, name: 'Butter Croissant', category: 'Bakery', price: 720, icon: '🥐' },
    { id: 8, name: 'Berry Tart', category: 'Bakery', price: 920, icon: '🧁' },
    { id: 9, name: 'Volt Tumbler', category: 'Retail', price: 3200, icon: '🥤' }
  ];
  const currency = new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR', maximumFractionDigits: 0 });
  const cart = new Map();
  let activeCategory = 'All';
  let searchTerm = '';
  const productGrid = document.querySelector('#pos-products');
  const categoryList = document.querySelector('#pos-categories');
  const cartItems = document.querySelector('#cart-items');
  const checkoutButton = document.querySelector('#checkout-button');

  function renderCategories() {
    const categories = ['All', ...new Set(products.map((product) => product.category))];
    categoryList.innerHTML = categories.map((category) => `<button class="${category === activeCategory ? 'is-active' : ''}" type="button" data-category="${category}">${category}</button>`).join('');
  }

  function renderProducts() {
    const visible = products.filter((product) => (activeCategory === 'All' || product.category === activeCategory) && product.name.toLowerCase().includes(searchTerm));
    productGrid.innerHTML = visible.map((product) => `<button class="product-card" type="button" data-product="${product.id}" aria-label="Add ${product.name} to cart"><span class="product-visual" aria-hidden="true">${product.icon}</span><span class="product-copy"><span>${product.name}</span><b>${currency.format(product.price)}</b></span></button>`).join('') || '<p class="empty-cart">No products found.</p>';
  }

  function renderCart() {
    const entries = [...cart.entries()];
    const quantity = entries.reduce((sum, [, count]) => sum + count, 0);
    const subtotal = entries.reduce((sum, [id, count]) => sum + products.find((product) => product.id === id).price * count, 0);
    const tax = subtotal * .08;
    const total = subtotal + tax;
    document.querySelector('#cart-count').textContent = quantity;
    document.querySelector('#cart-subtotal').textContent = currency.format(subtotal);
    document.querySelector('#cart-tax').textContent = currency.format(tax);
    document.querySelector('#cart-total').textContent = currency.format(total);
    document.querySelector('#checkout-total').textContent = currency.format(total);
    checkoutButton.disabled = !entries.length;
    cartItems.innerHTML = entries.length ? entries.map(([id, count]) => {
      const product = products.find((item) => item.id === id);
      return `<div class="cart-item"><div><strong>${product.name}</strong><small>${currency.format(product.price * count)}</small></div><div class="cart-quantity"><button type="button" data-cart-action="decrease" data-id="${id}" aria-label="Remove one ${product.name}">−</button><span>${count}</span><button type="button" data-cart-action="increase" data-id="${id}" aria-label="Add one ${product.name}">+</button></div></div>`;
    }).join('') : '<div class="empty-cart"><div><span>▱</span>Your order is empty.<br>Select a product to begin.</div></div>';
  }

  categoryList.addEventListener('click', (event) => {
    const button = event.target.closest('[data-category]');
    if (!button) return;
    activeCategory = button.dataset.category;
    renderCategories();
    renderProducts();
  });
  document.querySelector('#product-search').addEventListener('input', (event) => { searchTerm = event.target.value.trim().toLowerCase(); renderProducts(); });
  productGrid.addEventListener('click', (event) => {
    const button = event.target.closest('[data-product]');
    if (!button) return;
    const id = Number(button.dataset.product);
    cart.set(id, (cart.get(id) || 0) + 1);
    renderCart();
  });
  cartItems.addEventListener('click', (event) => {
    const button = event.target.closest('[data-cart-action]');
    if (!button) return;
    const id = Number(button.dataset.id);
    const next = (cart.get(id) || 0) + (button.dataset.cartAction === 'increase' ? 1 : -1);
    next > 0 ? cart.set(id, next) : cart.delete(id);
    renderCart();
  });
  document.querySelector('#clear-cart').addEventListener('click', () => { cart.clear(); renderCart(); });
  checkoutButton.addEventListener('click', () => {
    if (!cart.size) return;
    const toast = document.querySelector('#pos-toast');
    checkoutButton.disabled = true;
    checkoutButton.firstChild.textContent = 'Processing ';
    window.setTimeout(() => {
      toast.textContent = '✓ Payment approved. Order synced.';
      toast.classList.add('is-visible');
      cart.clear();
      renderCart();
      checkoutButton.firstChild.textContent = 'Charge ';
      window.setTimeout(() => toast.classList.remove('is-visible'), 2200);
    }, 700);
  });

  const dashboardData = {
    '7d': { revenue: 'LKR 4.82M', revenueChange: '↑ 18.4%', orders: '1,248', ordersChange: '↑ 11.2%', aov: 'LKR 3,862', aovChange: '↑ 6.5%', overdue: 'LKR 7.4M', chart: [42,58,48,72,63,84,76], labels: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'] },
    '30d': { revenue: 'LKR 18.6M', revenueChange: '↑ 14.1%', orders: '4,912', ordersChange: '↑ 9.8%', aov: 'LKR 3,786', aovChange: '↑ 4.2%', overdue: 'LKR 6.8M', chart: [48,62,55,70,66,78,88], labels: ['W1','','W2','','W3','','W4'] },
    '90d': { revenue: 'LKR 54.2M', revenueChange: '↑ 21.7%', orders: '14,806', ordersChange: '↑ 16.3%', aov: 'LKR 3,661', aovChange: '↑ 7.9%', overdue: 'LKR 5.9M', chart: [38,47,53,61,68,76,91], labels: ['Apr','','May','','Jun','','Now'] }
  };
  const units = [['STC Retail Group','LKR 847K','+18%'],['STC Hospitality Group','LKR 1.21M','+24%'],['STC Logistics Group','LKR 638K','+9%'],['STC Digital Group','LKR 348K','+16%']];

  function renderDashboard(period) {
    const data = dashboardData[period];
    document.querySelector('#metric-revenue').textContent = data.revenue;
    document.querySelector('#metric-revenue-change').textContent = data.revenueChange;
    document.querySelector('#metric-orders').textContent = data.orders;
    document.querySelector('#metric-orders-change').textContent = data.ordersChange;
    document.querySelector('#metric-aov').textContent = data.aov;
    document.querySelector('#metric-aov-change').textContent = data.aovChange;
    document.querySelector('#metric-overdue').textContent = data.overdue;
    document.querySelector('#chart-total').textContent = data.revenue;
    const chartWidth = 700;
    const points = data.chart.map((value, index) => `${(index + .5) * (chartWidth / data.chart.length)},${100 - value}`).join(' ');
    const markers = data.chart.map((value, index) => `<circle cx="${(index + .5) * (chartWidth / data.chart.length)}" cy="${100 - value}" r="3" style="--point-index:${index}"></circle>`).join('');
    const trendLine = `<svg class="chart-trend" viewBox="0 0 ${chartWidth} 100" preserveAspectRatio="none" aria-hidden="true"><polyline points="${points}" pathLength="1"></polyline>${markers}</svg>`;
    const bars = data.chart.map((value, index) => `<div class="chart-bar-wrap"><div class="chart-bar" style="height:${value}%"></div><small>${data.labels[index]}</small></div>`).join('');
    document.querySelector('#revenue-chart').innerHTML = trendLine + bars;
  }
  document.querySelector('#unit-list').innerHTML = units.map(([name, value, change]) => `<div class="unit-row"><div><strong>${name}</strong><small>${value}</small></div><span>${change}</span></div>`).join('');
  document.querySelector('.period-switcher').addEventListener('click', (event) => {
    const button = event.target.closest('[data-period]');
    if (!button) return;
    document.querySelectorAll('[data-period]').forEach((item) => item.classList.toggle('is-active', item === button));
    renderDashboard(button.dataset.period);
  });

  renderCategories();
  renderProducts();
  renderCart();
  renderDashboard('7d');
}

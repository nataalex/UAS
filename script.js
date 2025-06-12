document.addEventListener('DOMContentLoaded', function() {
    if (localStorage.getItem('cartIconHidden') === 'true') {
        document.querySelector('.cart-header').classList.add('hide-icon');
    }
});// Shopping cart functionality
let cart = {};
let cartItemCount = 0;
let favorites = {};

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
  loadCart();
  loadFavorites();
  renderCart();
  setupCartToggle();
  updateCartBadge();
  setupDarkMode();
});

// Load cart from localStorage
function loadCart() {
  const savedCart = localStorage.getItem('qinubiCart');
  if (savedCart) {
    cart = JSON.parse(savedCart);
    calculateCartItemCount();
  }
}

// Load favorites from localStorage
function loadFavorites() {
  const savedFavorites = localStorage.getItem('qinubiFavorites');
  if (savedFavorites) {
    favorites = JSON.parse(savedFavorites);
    // Update favorite buttons
    document.querySelectorAll('.favorite-btn').forEach(btn => {
      const productCard = btn.closest('.product-card');
      const productName = productCard.querySelector('.product-name').textContent;
      if (favorites[productName]) {
        btn.classList.add('active');
      }
    });
  }
}

// Save cart to localStorage
function saveCart() {
  localStorage.setItem('qinubiCart', JSON.stringify(cart));
  calculateCartItemCount();
  updateCartBadge();
}

// Save favorites to localStorage
function saveFavorites() {
  localStorage.setItem('qinubiFavorites', JSON.stringify(favorites));
}

// Calculate total items in cart
function calculateCartItemCount() {
  cartItemCount = Object.values(cart).reduce((total, qty) => total + qty, 0);
}

// Update cart badge
function updateCartBadge() {
  const badge = document.getElementById('cartBadge');
  if (cartItemCount > 0) {
    badge.style.display = 'flex';
    badge.textContent = cartItemCount;
  } else {
    badge.style.display = 'none';
  }
}

// Toggle favorite status
function toggleFavorite(btn) {
  btn.classList.toggle('active');
  const productCard = btn.closest('.product-card');
  const productName = productCard.querySelector('.product-name').textContent;
  
  if (btn.classList.contains('active')) {
    favorites[productName] = true;
  } else {
    delete favorites[productName];
  }
  
  saveFavorites();
}

// Render cart items
function renderCart() {
  const cartItemsEl = document.getElementById('cartItems');
  const cartTotalEl = document.getElementById('cartTotal');
  
  // Clear existing items
  cartItemsEl.innerHTML = '';
  
  if (Object.keys(cart).length === 0) {
    cartItemsEl.innerHTML = '<p class="empty-cart">Keranjang kosong.</p>';
    cartTotalEl.textContent = 'Total: Rp 0';
    return;
  }
  
  // Calculate total and render items
  let total = 0;
  
  for (const [product, quantity] of Object.entries(cart)) {
    const price = getProductPrice(product);
    const itemTotal = price * quantity;
    total += itemTotal;
    
    const itemEl = document.createElement('div');
    itemEl.className = 'cart-item';
    itemEl.innerHTML = `
      <div class="cart-item-info">
        <span>${product}</span>
        <div class="cart-item-controls">
          <button onclick="updateQuantity('${product}', -1)">-</button>
          <span>${quantity}</span>
          <button onclick="updateQuantity('${product}', 1)">+</button>
        </div>
        <span>Rp ${itemTotal.toLocaleString('id-ID')}</span>
      </div>
      <button class="cart-remove" onclick="removeFromCart('${product}')">✕</button>
    `;
    cartItemsEl.appendChild(itemEl);
  }
  
  // Update total
  cartTotalEl.textContent = `Total: Rp ${total.toLocaleString('id-ID')}`;
}

// Get product price
function getProductPrice(productName) {
  const prices = {
    "Nasi Goreng": 25000,
    "Mie Ayam": 22000,
    "Sate Ayam": 30000,
    "Bakso Urat": 28000,
    "Ayam Geprek": 27000,
    "Nasi Rendang": 32000,
    "Soto Ayam": 20000,
    "Rawon": 30000,
    "Gado-Gado": 18000,
    "Pecel Lele": 25000,
    "Nasi Uduk": 22000,
    "Capcay": 24000,
    "Bubur Ayam": 15000,
    "Ketoprak": 16000,
    "Sop Buntut": 35000,
    "Ikan Bakar": 30000,
    "Nasi Kuning": 20000,
    "Lontong Sayur": 18000,
    "Nasi Campur": 25000,
    "Ayam Bakar": 28000,
    "Nasi Liwet": 23000,
    "Tahu Tek": 17000,
    "Nasi Kucing": 10000,
    "Martabak Manis": 25000
  };
  
  return prices[productName] || 0;
}

// Add item to cart
function addToCart(productName, price) {
  cart[productName] = (cart[productName] || 0) + 1;
  saveCart();
  renderCart();
  
  // Show notification
  showNotification(`${productName} ditambahkan ke keranjang!`);
}

// Show notification
function showNotification(message) {
  const notification = document.createElement('div');
  notification.className = 'notification';
  notification.textContent = message;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.animation = 'fadeOut 0.5s';
    setTimeout(() => notification.remove(), 500);
  }, 2000);
}

// Update item quantity in cart
function updateQuantity(productName, change) {
  const newQuantity = (cart[productName] || 0) + change;
  
  if (newQuantity < 1) {
    removeFromCart(productName);
  } else {
    cart[productName] = newQuantity;
    saveCart();
    renderCart();
  }
}

// Remove item from cart
function removeFromCart(productName) {
  if (cart[productName]) {
    delete cart[productName];
    saveCart();
    renderCart();
    showNotification(`${productName} dihapus dari keranjang`);
  }
}

// Clear entire cart
function clearCart() {
  if (Object.keys(cart).length === 0) {
    showNotification('Keranjang sudah kosong');
    return;
  }
  
  if (confirm('Apakah Anda yakin ingin mengosongkan keranjang?')) {
    cart = {};
    saveCart();
    renderCart();
    showNotification('Keranjang telah dikosongkan');
  }
}

// Checkout process
function checkout() {
  if (Object.keys(cart).length === 0) {
    showNotification('Keranjang belanja kosong');
    return;
  }
  
  let orderDetails = 'Detail Pesanan:\n\n';
  let total = 0;
  
  for (const [product, quantity] of Object.entries(cart)) {
    const price = getProductPrice(product);
    const itemTotal = price * quantity;
    total += itemTotal;
    orderDetails += `${product} x${quantity} = Rp ${itemTotal.toLocaleString('id-ID')}\n`;
  }
  
  orderDetails += `\nTotal: Rp ${total.toLocaleString('id-ID')}\n\n`;
  orderDetails += 'Terima kasih atas pesanan Anda!';
  
  alert(orderDetails);
  clearCart();
}

// Place direct order (single item)
function placeOrder(productName, price) {
  alert(`Anda telah memesan:\n\n${productName}\nRp ${price.toLocaleString('id-ID')}\n\nTerima kasih!`);
}

// Search products
function searchProducts() {
  const searchTerm = document.getElementById('searchInput').value.toLowerCase();
  const products = document.querySelectorAll('.product-card');
  
  products.forEach(product => {
    const name = product.querySelector('.product-name').textContent.toLowerCase();
    const desc = product.querySelector('.product-description').textContent.toLowerCase();
    
    if (name.includes(searchTerm) || desc.includes(searchTerm)) {
      product.style.display = 'flex';
    } else {
      product.style.display = 'none';
    }
  });
}

// Filter products by category
function filterProducts(category) {
  const products = document.querySelectorAll('.product-card');
  const filterBtns = document.querySelectorAll('.filter-btn');
  
  // Update active button
  filterBtns.forEach(btn => {
    btn.classList.remove('active');
    if (btn.textContent.toLowerCase() === category || 
        (category === 'all' && btn.textContent.toLowerCase() === 'semua')) {
      btn.classList.add('active');
    }
  });
  
  // Filter products
  products.forEach(product => {
    const name = product.querySelector('.product-name').textContent.toLowerCase();
    const desc = product.querySelector('.product-description').textContent.toLowerCase();
    
    if (category === 'all' || 
        (category === 'nasi' && name.includes('nasi')) ||
        (category === 'mie' && (name.includes('mie') || name.includes('bakso'))) ||
        (category === 'ayam' && (name.includes('ayam') || desc.includes('ayam'))) ||
        (category === 'snack' && (name.includes('martabak') || name.includes('ketoprak') || name.includes('bubur')))) {
      product.style.display = 'flex';
      setTimeout(() => {
        product.style.opacity = '1';
      }, 50);
    } else {
      product.style.opacity = '0';
      setTimeout(() => {
        product.style.display = 'none';
      }, 300);
    }
  });
}

// Setup cart toggle functionality
function setupCartToggle() {
  const cartToggle = document.getElementById('cartToggle');
  const cartSidebar = document.getElementById('cartSidebar');
  
  cartToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    cartSidebar.classList.toggle('open');
  });
  
  // Close cart when clicking outside
  document.addEventListener('click', (e) => {
    if (!cartSidebar.contains(e.target) && e.target !== cartToggle) {
      cartSidebar.classList.remove('open');
    }
  });
  
  // Prevent cart from closing when clicking inside
  cartSidebar.addEventListener('click', (e) => {
    e.stopPropagation();
  });
}

// Setup dark mode
function setupDarkMode() {
  const darkModeToggle = document.getElementById('darkModeToggle');
  
  darkModeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
    
    // Update variables for dark mode
    if (document.body.classList.contains('dark-mode')) {
      document.documentElement.style.setProperty('--header-bg', '#1a1a1a');
      document.documentElement.style.setProperty('--divider-color', '#333');
    } else {
      document.documentElement.style.setProperty('--header-bg', '#2c3e50');
      document.documentElement.style.setProperty('--divider-color', '#e0e0e0');
    }
  });
  
  // Load dark mode preference
  if (localStorage.getItem('darkMode') === 'true') {
    document.body.classList.add('dark-mode');
    document.documentElement.style.setProperty('--header-bg', '#1a1a1a');
    document.documentElement.style.setProperty('--divider-color', '#333');
  }
}
// Tambahkan di script.js
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    e.preventDefault();
    document.querySelector(this.getAttribute('href')).scrollIntoView({
      behavior: 'smooth'
    });
  });
});
// Tambahkan di bagian akhir file script.js
function animateOnScroll() {
  const productCards = document.querySelectorAll('.product-card');
  
  productCards.forEach((card, index) => {
    card.style.setProperty('--order', index);
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
        }
      });
    }, { threshold: 0.1 });
    
    observer.observe(card);
  });
}

// Panggil fungsi ini saat DOM siap
document.addEventListener('DOMContentLoaded', () => {
  // ... kode yang sudah ada ...
  animateOnScroll();
});
document.querySelector('.cart-header').addEventListener('click', function() {
    this.classList.toggle('hide-icon');
    
    // Simpan state di localStorage agar tetap konsisten
    if (this.classList.contains('hide-icon')) {
        localStorage.setItem('cartIconHidden', 'true');
    } else {
        localStorage.setItem('cartIconHidden', 'false');
    }
});

// Cek state saat load halaman

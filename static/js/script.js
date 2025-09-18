/*
Author: N H Padma Priya
Year: 2025
*/

// Global variables
let cart = [];
let currentCategory = 'all';
let currentPage = 'home';
let products = [];
let subscribers = [];
let currentUser = null;

// Load current user from localStorage (frontend-only auth)
try {
    const savedUser = localStorage.getItem('lunaraCurrentUser');
    if (savedUser) currentUser = JSON.parse(savedUser);
} catch (e) {
    console.warn('Could not parse saved user', e);
}

function updateAuthUI() {
    const userBtnEl = document.getElementById('userBtn');
    const logoutEl = document.getElementById('logoutLink');
    const loginLinks = document.querySelectorAll('#userDropdown a[data-page="login"], #userDropdown a[data-page="signup"]');
    if (currentUser) {
        const first = currentUser.name ? currentUser.name.split(' ')[0] : 'Account';
        if (userBtnEl) userBtnEl.innerHTML = `<i class="fas fa-user"></i> ${first}`;
        if (logoutEl) logoutEl.style.display = 'block';
        loginLinks.forEach(a => a.style.display = 'none');
    } else {
        if (userBtnEl) userBtnEl.innerHTML = '<i class="fas fa-user"></i>';
        if (logoutEl) logoutEl.style.display = 'none';
        loginLinks.forEach(a => a.style.display = 'block');
    }
}

// Resolve product image to local static path
function getProductImage(product) {
    const img = (product && product.image) ? String(product.image) : '';
    if (img.startsWith('/static/images/') || img.startsWith('static/images/')) {
        return img;
    }
    const map = { 'Rings': 'ring', 'Necklaces': 'necklace', 'Bracelets': 'bracelet', 'Earrings': 'earring' };
    const base = map[product.category] || 'ring';
    const index = ((product.id - 1) % 12) + 1; // keep within 1-12 per category
    return `/static/images/${base}${index}.jpg`;
}

// Initialize the application
document.addEventListener('DOMContentLoaded', function () {
    // Fetch products from backend
    fetch('/api/products')
        .then(response => response.json())
        .then(data => {
            products = data.map(p => ({ ...p, image: getProductImage(p) }));
            // Render initial products
            renderProducts();
            updateCartCount();
            // Set up event listeners
            setupEventListeners();
            updateAuthUI();
        })
        .catch(error => {
            console.error('Error loading products:', error);
            // Fallback to local data if API fails
            initializeApp();
        });
});

// Initialize the application with local data
function initializeApp() {
    // Comprehensive product data with 10+ products per category
    products = [
        // Rings (12 products)
        {
            id: 1,
            name: "Selene Thin Band",
            category: "Rings",
            price: 2499,
            originalPrice: 2999,
            image: "https://placehold.co/300x300/1e3a8a/white?text=Ring+1",
            rating: 4.8,
            reviews: 42,
            inventory: 15
        },
        {
            id: 2,
            name: "Celeste Stack Ring",
            category: "Rings",
            price: 3499,
            originalPrice: 3999,
            image: "https://placehold.co/300x300/1e3a8a/white?text=Ring+2",
            rating: 4.9,
            reviews: 33,
            inventory: 8
        },
        {
            id: 3,
            name: "Aurora Promise Ring",
            category: "Rings",
            price: 4299,
            originalPrice: null,
            image: "https://placehold.co/300x300/1e3a8a/white?text=Ring+3",
            rating: 4.7,
            reviews: 29,
            inventory: 12
        },
        {
            id: 4,
            name: "Luna Statement Ring",
            category: "Rings",
            price: 3799,
            originalPrice: 4299,
            image: "https://placehold.co/300x300/1e3a8a/white?text=Ring+4",
            rating: 4.6,
            reviews: 51,
            inventory: 6
        },
        {
            id: 5,
            name: "Stella Minimalist Band",
            category: "Rings",
            price: 1999,
            originalPrice: null,
            image: "https://placehold.co/300x300/1e3a8a/white?text=Ring+5",
            rating: 4.8,
            reviews: 38,
            inventory: 20
        },
        {
            id: 6,
            name: "Nova Engagement Ring",
            category: "Rings",
            price: 8999,
            originalPrice: 9999,
            image: "https://placehold.co/300x300/1e3a8a/white?text=Ring+6",
            rating: 4.9,
            reviews: 45,
            inventory: 3
        },
        {
            id: 7,
            name: "Eclipse Adjustable Ring",
            category: "Rings",
            price: 2299,
            originalPrice: null,
            image: "https://placehold.co/300x300/1e3a8a/white?text=Ring+7",
            rating: 4.5,
            reviews: 27,
            inventory: 18
        },
        {
            id: 8,
            name: "Vega Diamond Ring",
            category: "Rings",
            price: 5499,
            originalPrice: 5999,
            image: "https://placehold.co/300x300/1e3a8a/white?text=Ring+8",
            rating: 4.7,
            reviews: 31,
            inventory: 5
        },
        {
            id: 9,
            name: "Orion Signet Ring",
            category: "Rings",
            price: 3199,
            originalPrice: null,
            image: "https://placehold.co/300x300/1e3a8a/white?text=Ring+9",
            rating: 4.6,
            reviews: 24,
            inventory: 10
        },
        {
            id: 10,
            name: "Polaris Wedding Band",
            category: "Rings",
            price: 2899,
            originalPrice: 3299,
            image: "https://placehold.co/300x300/1e3a8a/white?text=Ring+10",
            rating: 4.8,
            reviews: 36,
            inventory: 14
        },
        {
            id: 11,
            name: "Sirius Infinity Ring",
            category: "Rings",
            price: 3699,
            originalPrice: null,
            image: "https://placehold.co/300x300/1e3a8a/white?text=Ring+11",
            rating: 4.7,
            reviews: 28,
            inventory: 9
        },
        {
            id: 12,
            name: "Lyra Vintage Ring",
            category: "Rings",
            price: 4199,
            originalPrice: 4699,
            image: "https://placehold.co/300x300/1e3a8a/white?text=Ring+12",
            rating: 4.9,
            reviews: 41,
            inventory: 7
        },

        // Necklaces (12 products)
        {
            id: 13,
            name: "Nova Bar Necklace",
            category: "Necklaces",
            price: 3299,
            originalPrice: 3999,
            image: "https://placehold.co/300x300/3b82f6/white?text=Necklace+1",
            rating: 4.9,
            reviews: 38,
            inventory: 12
        },
        {
            id: 14,
            name: "Luna Pendant Necklace",
            category: "Necklaces",
            price: 2799,
            originalPrice: null,
            image: "https://placehold.co/300x300/3b82f6/white?text=Necklace+2",
            rating: 4.8,
            reviews: 45,
            inventory: 18
        },
        {
            id: 15,
            name: "Aurora Choker",
            category: "Necklaces",
            price: 2499,
            originalPrice: 2999,
            image: "https://placehold.co/300x300/3b82f6/white?text=Necklace+3",
            rating: 4.7,
            reviews: 32,
            inventory: 10
        },
        {
            id: 16,
            name: "Stella Layered Necklace",
            category: "Necklaces",
            price: 3999,
            originalPrice: null,
            image: "https://placehold.co/300x300/3b82f6/white?text=Necklace+4",
            rating: 4.8,
            reviews: 29,
            inventory: 8
        },
        {
            id: 17,
            name: "Eclipse Statement Necklace",
            category: "Necklaces",
            price: 4799,
            originalPrice: 5299,
            image: "https://placehold.co/300x300/3b82f6/white?text=Necklace+5",
            rating: 4.6,
            reviews: 26,
            inventory: 5
        },
        {
            id: 18,
            name: "Vega Diamond Pendant",
            category: "Necklaces",
            price: 5999,
            originalPrice: null,
            image: "https://placehold.co/300x300/3b82f6/white?text=Necklace+6",
            rating: 4.9,
            reviews: 42,
            inventory: 4
        },
        {
            id: 19,
            name: "Orion Chain Necklace",
            category: "Necklaces",
            price: 2199,
            originalPrice: 2499,
            image: "https://placehold.co/300x300/3b82f6/white?text=Necklace+7",
            rating: 4.5,
            reviews: 33,
            inventory: 15
        },
        {
            id: 20,
            name: "Polaris Minimalist Chain",
            category: "Necklaces",
            price: 1899,
            originalPrice: null,
            image: "https://placehold.co/300x300/3b82f6/white?text=Necklace+8",
            rating: 4.7,
            reviews: 37,
            inventory: 20
        },
        {
            id: 21,
            name: "Sirius Pendant Set",
            category: "Necklaces",
            price: 3499,
            originalPrice: 3999,
            image: "https://placehold.co/300x300/3b82f6/white?text=Necklace+9",
            rating: 4.8,
            reviews: 30,
            inventory: 9
        },
        {
            id: 22,
            name: "Lyra Boho Necklace",
            category: "Necklaces",
            price: 2999,
            originalPrice: null,
            image: "https://placehold.co/300x300/3b82f6/white?text=Necklace+10",
            rating: 4.6,
            reviews: 28,
            inventory: 11
        },
        {
            id: 23,
            name: "Selene Y-Necklace",
            category: "Necklaces",
            price: 3699,
            originalPrice: 4199,
            image: "https://placehold.co/300x300/3b82f6/white?text=Necklace+11",
            rating: 4.7,
            reviews: 34,
            inventory: 7
        },
        {
            id: 24,
            name: "Celeste Pearl Necklace",
            category: "Necklaces",
            price: 4299,
            originalPrice: null,
            image: "https://placehold.co/300x300/3b82f6/white?text=Necklace+12",
            rating: 4.9,
            reviews: 39,
            inventory: 6
        },

        // Bracelets (12 products)
        {
            id: 25,
            name: "Aurora Cuff Bracelet",
            category: "Bracelets",
            price: 2899,
            originalPrice: null,
            image: "https://placehold.co/300x300/60a5fa/white?text=Bracelet+1",
            rating: 4.7,
            reviews: 29,
            inventory: 14
        },
        {
            id: 26,
            name: "Stella Tennis Bracelet",
            category: "Bracelets",
            price: 4299,
            originalPrice: 4799,
            image: "https://placehold.co/300x300/60a5fa/white?text=Bracelet+2",
            rating: 4.8,
            reviews: 35,
            inventory: 8
        },
        {
            id: 27,
            name: "Eclipse Chain Bracelet",
            category: "Bracelets",
            price: 2199,
            originalPrice: null,
            image: "https://placehold.co/300x300/60a5fa/white?text=Bracelet+3",
            rating: 4.6,
            reviews: 27,
            inventory: 16
        },
        {
            id: 28,
            name: "Vega Bangle Set",
            category: "Bracelets",
            price: 3499,
            originalPrice: 3999,
            image: "https://placehold.co/300x300/60a5fa/white?text=Bracelet+4",
            rating: 4.9,
            reviews: 41,
            inventory: 5
        },
        {
            id: 29,
            name: "Orion Leather Bracelet",
            category: "Bracelets",
            price: 1999,
            originalPrice: null,
            image: "https://placehold.co/300x300/60a5fa/white?text=Bracelet+5",
            rating: 4.5,
            reviews: 32,
            inventory: 18
        },
        {
            id: 30,
            name: "Polaris Charm Bracelet",
            category: "Bracelets",
            price: 2799,
            originalPrice: 3199,
            image: "https://placehold.co/300x300/60a5fa/white?text=Bracelet+6",
            rating: 4.7,
            reviews: 28,
            inventory: 12
        },
        {
            id: 31,
            name: "Sirius Cufflink",
            category: "Bracelets",
            price: 3299,
            originalPrice: null,
            image: "https://placehold.co/300x300/60a5fa/white?text=Bracelet+7",
            rating: 4.8,
            reviews: 24,
            inventory: 10
        },
        {
            id: 32,
            name: "Lyra Stackable Bracelet",
            category: "Bracelets",
            price: 3999,
            originalPrice: 4499,
            image: "https://placehold.co/300x300/60a5fa/white?text=Bracelet+8",
            rating: 4.6,
            reviews: 36,
            inventory: 7
        },
        {
            id: 33,
            name: "Selene Minimalist Bracelet",
            category: "Bracelets",
            price: 1899,
            originalPrice: null,
            image: "https://placehold.co/300x300/60a5fa/white?text=Bracelet+9",
            rating: 4.7,
            reviews: 30,
            inventory: 19
        },
        {
            id: 34,
            name: "Celeste Statement Cuff",
            category: "Bracelets",
            price: 4599,
            originalPrice: 4999,
            image: "https://placehold.co/300x300/60a5fa/white?text=Bracelet+10",
            rating: 4.9,
            reviews: 33,
            inventory: 4
        },
        {
            id: 35,
            name: "Nova Adjustable Bracelet",
            category: "Bracelets",
            price: 2399,
            originalPrice: null,
            image: "https://placehold.co/300x300/60a5fa/white?text=Bracelet+11",
            rating: 4.6,
            reviews: 26,
            inventory: 15
        },
        {
            id: 36,
            name: "Luna Beaded Bracelet",
            category: "Bracelets",
            price: 2699,
            originalPrice: 2999,
            image: "https://placehold.co/300x300/60a5fa/white?text=Bracelet+12",
            rating: 4.8,
            reviews: 31,
            inventory: 11
        },

        // Earrings (12 products)
        {
            id: 37,
            name: "Stella Hoop Earrings",
            category: "Earrings",
            price: 1999,
            originalPrice: 2499,
            image: "https://placehold.co/300x300/0ea5e9/white?text=Earring+1",
            rating: 4.6,
            reviews: 51,
            inventory: 20
        },
        {
            id: 38,
            name: "Eclipse Stud Earrings",
            category: "Earrings",
            price: 2499,
            originalPrice: null,
            image: "https://placehold.co/300x300/0ea5e9/white?text=Earring+2",
            rating: 4.7,
            reviews: 38,
            inventory: 15
        },
        {
            id: 39,
            name: "Vega Drop Earrings",
            category: "Earrings",
            price: 3299,
            originalPrice: 3799,
            image: "https://placehold.co/300x300/0ea5e9/white?text=Earring+3",
            rating: 4.8,
            reviews: 42,
            inventory: 9
        },
        {
            id: 40,
            name: "Orion Statement Earrings",
            category: "Earrings",
            price: 3999,
            originalPrice: null,
            image: "https://placehold.co/300x300/0ea5e9/white?text=Earring+4",
            rating: 4.9,
            reviews: 35,
            inventory: 6
        },
        {
            id: 41,
            name: "Polaris Ear Cuffs",
            category: "Earrings",
            price: 1799,
            originalPrice: 1999,
            image: "https://placehold.co/300x300/0ea5e9/white?text=Earring+5",
            rating: 4.5,
            reviews: 29,
            inventory: 18
        },
        {
            id: 42,
            name: "Sirius Huggie Earrings",
            category: "Earrings",
            price: 1599,
            originalPrice: null,
            image: "https://placehold.co/300x300/0ea5e9/white?text=Earring+6",
            rating: 4.7,
            reviews: 44,
            inventory: 22
        },
        {
            id: 43,
            name: "Lyra Chandelier Earrings",
            category: "Earrings",
            price: 4499,
            originalPrice: 4999,
            image: "https://placehold.co/300x300/0ea5e9/white?text=Earring+7",
            rating: 4.8,
            reviews: 27,
            inventory: 4
        },
        {
            id: 44,
            name: "Selene Threader Earrings",
            category: "Earrings",
            price: 2199,
            originalPrice: null,
            image: "https://placehold.co/300x300/0ea5e9/white?text=Earring+8",
            rating: 4.6,
            reviews: 33,
            inventory: 14
        },
        {
            id: 45,
            name: "Celeste Geometric Earrings",
            category: "Earrings",
            price: 2899,
            originalPrice: 3299,
            image: "https://placehold.co/300x300/0ea5e9/white?text=Earring+9",
            rating: 4.7,
            reviews: 36,
            inventory: 11
        },
        {
            id: 46,
            name: "Nova Pearl Earrings",
            category: "Earrings",
            price: 2699,
            originalPrice: null,
            image: "https://placehold.co/300x300/0ea5e9/white?text=Earring+10",
            rating: 4.8,
            reviews: 39,
            inventory: 12
        },
        {
            id: 47,
            name: "Luna Asymmetrical Earrings",
            category: "Earrings",
            price: 3199,
            originalPrice: 3599,
            image: "https://placehold.co/300x300/0ea5e9/white?text=Earring+11",
            rating: 4.9,
            reviews: 31,
            inventory: 7
        },
        {
            id: 48,
            name: "Aurora Crystal Earrings",
            category: "Earrings",
            price: 3599,
            originalPrice: null,
            image: "https://placehold.co/300x300/0ea5e9/white?text=Earring+12",
            rating: 4.7,
            reviews: 28,
            inventory: 8
        }
    ];

    // Normalize images to local static paths
    products = products.map(p => ({ ...p, image: getProductImage(p) }));

    // Render initial products
    renderProducts();
    updateCartCount();

    // Set up event listeners
    setupEventListeners();
    updateAuthUI();
}

// Set up all event listeners
function setupEventListeners() {
    // DOM Elements
    const cartIcon = document.getElementById('cartIcon');
    const cartModal = document.getElementById('cartModal');
    const closeCartModal = document.getElementById('closeCartModal');
    const categoryTabs = document.querySelectorAll('.category-tab');
    const checkoutBtn = document.getElementById('checkoutBtn');
    const newsletterForm = document.getElementById('newsletterForm');
    const shopNowBtn = document.getElementById('shopNowBtn');
    const learnMoreBtn = document.getElementById('learnMoreBtn');
    const contactForm = document.getElementById('contactForm');
    const navLinks = document.querySelectorAll('.nav-link');
    const footerLinks = document.querySelectorAll('.footer-links a[data-page]');
    const logo = document.querySelector('.logo');
    const faqQuestions = document.querySelectorAll('.faq-question');
    const userBtn = document.getElementById('userBtn');
    const userDropdown = document.getElementById('userDropdown');
    const searchIcon = document.getElementById('searchIcon');
    const paymentModal = document.getElementById('paymentModal');
    const closePaymentModal = document.getElementById('closePaymentModal');
    const payNowBtn = document.getElementById('payNowBtn');
    const paymentMethods = document.querySelectorAll('.payment-method');
    const logoutLink = document.getElementById('logoutLink');
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');

    // Cart modal
    cartIcon.addEventListener('click', () => {
        cartModal.style.display = 'flex';
        renderCartItems();
    });

    closeCartModal.addEventListener('click', () => {
        cartModal.style.display = 'none';
    });

    window.addEventListener('click', (e) => {
        if (e.target === cartModal) {
            cartModal.style.display = 'none';
        }
        if (e.target === paymentModal) {
            paymentModal.style.display = 'none';
        }
    });

    // Category tabs
    categoryTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            categoryTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            currentCategory = tab.dataset.category;

            if (currentPage === 'home') {
                renderProducts();
            } else if (currentPage === 'catalog') {
                renderCatalogProducts();
            }
        });
    });

    // Checkout button
    checkoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (cart.length === 0) {
            showNotification('Your cart is empty!', 'warning');
            return;
        }
        if (!currentUser) {
            showNotification('Please log in to checkout', 'error');
            switchPage('login');
            return;
        }
        // Show payment modal
        cartModal.style.display = 'none';
        paymentModal.style.display = 'flex';
        updatePaymentSummary();
    });

    // Payment modal
    closePaymentModal.addEventListener('click', () => {
        paymentModal.style.display = 'none';
    });

    // Payment methods
    paymentMethods.forEach(method => {
        method.addEventListener('click', () => {
            paymentMethods.forEach(m => m.classList.remove('active'));
            method.classList.add('active');
            
            // Show/hide payment details
            document.getElementById('cardPayment').style.display = 'none';
            document.getElementById('upiPayment').style.display = 'none';
            document.getElementById('paypalPayment').style.display = 'none';
            
            const methodType = method.dataset.method;
            document.getElementById(`${methodType}Payment`).style.display = 'block';
        });
    });

    // Pay Now button
    payNowBtn.addEventListener('click', (e) => {
        e.preventDefault();
        processPayment();
    });

    // Newsletter form
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const emailInput = newsletterForm.querySelector('input[type="email"]');
            if (emailInput && emailInput.value) {
                const email = emailInput.value;
                
                // Send subscription request to backend
                fetch('/api/subscribe', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email: email })
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        showNotification(`Thank you for subscribing with ${email}! You'll receive 10% off your first order.`);
                        newsletterForm.reset();
                    } else {
                        showNotification(data.message || 'Subscription failed. Please try again.', 'error');
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    // Fallback success to keep UX smooth
                    showNotification("Thank you for subscribing! You'll receive 10% off your first order.");
                    newsletterForm.reset();
                });
            } else {
                showNotification('Please enter a valid email address', 'error');
            }
        });
    }

    // Contact form
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        showNotification('Thank you for your message! We will get back to you soon.');
        e.target.reset();
    });

    // Shop Now button
    shopNowBtn.addEventListener('click', (e) => {
        e.preventDefault();
        switchPage('catalog');
    });

    // Learn More button
    learnMoreBtn.addEventListener('click', (e) => {
        e.preventDefault();
        switchPage('about');
    });

    // Search functionality with direct display on Catalog
    searchIcon.addEventListener('click', () => {
        const searchTerm = prompt('Enter product name to search:');
        if (!searchTerm) return;
        const term = searchTerm.trim().toLowerCase();
        const results = products.filter(p => p.name.toLowerCase().includes(term));

        currentCategory = 'all';
        switchPage('catalog');
        const grid = document.getElementById('catalogProductsGrid');
        grid.innerHTML = '';

        const header = document.createElement('div');
        header.style.gridColumn = '1/-1';
        header.style.marginBottom = '10px';
        header.innerHTML = `<div style="display:flex; justify-content: space-between; align-items: center;">
            <div>${results.length} result(s) for "${searchTerm}"</div>
            <a href="#" id="clearSearchLink">Clear search</a>
        </div>`;
        grid.appendChild(header);

        if (results.length === 0) {
            grid.innerHTML += '<p style="text-align: center; grid-column: 1/-1; padding: 40px;">No products found</p>';
            return;
        }

        results.forEach(product => {
            const card = document.createElement('div');
            card.className = 'product-card';
            card.innerHTML = `
                <div class="product-image">
                    <img src="${product.image}" alt="${product.name}">
                    ${product.originalPrice ? `<div class="product-badge">Sale</div>` : ''}
                </div>
                <div class="product-info">
                    <div class="product-category">${product.category}</div>
                    <h3 class="product-title">${product.name}</h3>
                    <div class="product-price">
                        <span class="current-price">₹${product.price.toLocaleString()}</span>
                        ${product.originalPrice ? `<span class="original-price">₹${product.originalPrice.toLocaleString()}</span>` : ''}
                    </div>
                    <div class="product-rating">
                        <div class="rating-stars">${'★'.repeat(Math.floor(product.rating))}${product.rating % 1 >= 0.5 ? '½' : ''}${'☆'.repeat(5 - Math.ceil(product.rating))}</div>
                        <span>(${product.reviews})</span>
                    </div>
                    <button class="add-to-cart" onclick="addToCart(${product.id})" ${product.inventory <= 0 ? 'disabled' : ''}>
                        ${product.inventory <= 0 ? 'Out of Stock' : 'Add to Cart'}
                    </button>
                </div>
            `;
            grid.appendChild(card);
        });

        const clear = document.getElementById('clearSearchLink');
        if (clear) {
            clear.addEventListener('click', (e) => {
                e.preventDefault();
                document.querySelectorAll('.category-tab').forEach(t => t.classList.remove('active'));
                document.querySelector('.category-tab[data-category="all"]').classList.add('active');
                renderCatalogProducts();
            });
        }
    });

    // Navigation links
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            switchPage(link.dataset.page);
        });
    });

    // Footer links
    footerLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            switchPage(link.dataset.page);
        });
    });

    // Logo click
    logo.addEventListener('click', (e) => {
        e.preventDefault();
        switchPage('home');
    });

    // User menu toggle
    userBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        userDropdown.classList.toggle('show');
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!userBtn.contains(e.target) && !userDropdown.contains(e.target)) {
            userDropdown.classList.remove('show');
        }
    });

    // Footer category links
    document.querySelectorAll('.footer-category-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            currentCategory = link.dataset.category;

            // Update active tab
            document.querySelectorAll('.category-tab').forEach(tab => {
                tab.classList.remove('active');
                if (tab.dataset.category === currentCategory) {
                    tab.classList.add('active');
                }
            });

            switchPage('catalog');
        });
    });

    // User dropdown page links (login/signup)
    document.querySelectorAll('#userDropdown a[data-page]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            switchPage(link.dataset.page);
            userDropdown.classList.remove('show');
        });
    });

    // Logout handler (backend)
    if (logoutLink) {
        logoutLink.addEventListener('click', (e) => {
            e.preventDefault();
            fetch('/api/logout', { method: 'POST' })
            .finally(() => {
                currentUser = null;
                try { localStorage.removeItem('lunaraCurrentUser'); } catch(e){}
                updateAuthUI();
                showNotification('You have been logged out successfully');
                switchPage('home');
            });
        });
    }

    // Login form handler (backend)
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('loginEmail').value.trim();
            const password = document.getElementById('loginPassword').value;

            fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    currentUser = data.user;
                    try { localStorage.setItem('lunaraCurrentUser', JSON.stringify(currentUser)); } catch(e){}
                    updateAuthUI();
                    showNotification(`Welcome back, ${currentUser.name.split(' ')[0]}!`);
                    switchPage('home');
                    loginForm.reset();
                } else {
                    showNotification(data.message || 'Invalid email or password', 'error');
                    const err = document.getElementById('loginPasswordError');
                    if (err) { err.textContent = data.message || 'Invalid email or password'; err.style.display = 'block'; }
                }
            })
            .catch(() => {
                showNotification('Login failed. Please try again.', 'error');
            });
        });
    }

    // Signup form handler (backend)
    if (signupForm) {
        signupForm.addEventListener('submit', (e) => {
            e.preventDefault();
            ['signupNameError','signupEmailError','signupPasswordError','signupConfirmPasswordError'].forEach(id => {
                const el = document.getElementById(id);
                if (el) { el.textContent = ''; el.style.display = 'none'; }
            });

            const name = document.getElementById('signupName').value.trim();
            const email = document.getElementById('signupEmail').value.trim();
            const password = document.getElementById('signupPassword').value;
            const confirmPassword = document.getElementById('signupConfirmPassword').value;

            if (!name || name.length < 2) {
                const el = document.getElementById('signupNameError'); if (el) { el.textContent = 'Name must be at least 2 characters'; el.style.display = 'block'; }
                return;
            }
            if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                const el = document.getElementById('signupEmailError'); if (el) { el.textContent = 'Please enter a valid email address'; el.style.display = 'block'; }
                return;
            }
            if (!password || password.length < 6) {
                const el = document.getElementById('signupPasswordError'); if (el) { el.textContent = 'Password must be at least 6 characters'; el.style.display = 'block'; }
                return;
            }
            if (password !== confirmPassword) {
                const el = document.getElementById('signupConfirmPasswordError'); if (el) { el.textContent = 'Passwords do not match'; el.style.display = 'block'; }
                return;
            }

            fetch('/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password })
            })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    currentUser = data.user;
                    try { localStorage.setItem('lunaraCurrentUser', JSON.stringify(currentUser)); } catch(e){}
                    updateAuthUI();
                    showNotification('Account created successfully!');
                    switchPage('home');
                    signupForm.reset();
                } else {
                    showNotification(data.message || 'Registration failed', 'error');
                    const el = document.getElementById('signupEmailError');
                    if (el && data.message) { el.textContent = data.message; el.style.display = 'block'; }
                }
            })
            .catch(() => {
                showNotification('Registration failed. Please try again.', 'error');
            });
        });
    }

    // FAQ functionality
    faqQuestions.forEach(question => {
        question.addEventListener('click', () => {
            const faqId = question.dataset.faq;
            const answer = document.getElementById(`faq-answer-${faqId}`);
            const toggle = question.querySelector('.faq-toggle');

            answer.classList.toggle('show');
            toggle.classList.toggle('rotated');
        });
    });
}

// Page switching function
function switchPage(page) {
    // Hide all pages
    document.querySelectorAll('.page-content').forEach(pageEl => {
        pageEl.classList.remove('active');
    });

    // Show selected page
    document.getElementById(`${page}-page`).classList.add('active');

    // Update navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.dataset.page === page) {
            link.classList.add('active');
        }
    });

    currentPage = page;

    // Render products if switching to catalog
    if (page === 'catalog') {
        renderCatalogProducts();
    }

    // Scroll to top
    window.scrollTo(0, 0);
}

// Render products for home page
function renderProducts() {
    const filteredProducts = currentCategory === 'all'
        ? products.slice(0, 8) // Show only 8 featured products on home
        : products.filter(product => product.category === currentCategory).slice(0, 8);

    const productsGrid = document.getElementById('productsGrid');
    productsGrid.innerHTML = '';

    if (filteredProducts.length === 0) {
        productsGrid.innerHTML = '<p style="text-align: center; grid-column: 1/-1; padding: 40px;">No products found in this category</p>';
        return;
    }

    filteredProducts.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.innerHTML = `
            <div class="product-image">
                <img src="${product.image}" alt="${product.name}">
                ${product.originalPrice ? `<div class="product-badge">Sale</div>` : ''}
            </div>
            <div class="product-info">
                <div class="product-category">${product.category}</div>
                <h3 class="product-title">${product.name}</h3>
                <div class="product-price">
                    <span class="current-price">₹${product.price.toLocaleString()}</span>
                    ${product.originalPrice ? `<span class="original-price">₹${product.originalPrice.toLocaleString()}</span>` : ''}
                </div>
                <div class="product-rating">
                    <div class="rating-stars">${'★'.repeat(Math.floor(product.rating))}${product.rating % 1 >= 0.5 ? '½' : ''}${'☆'.repeat(5 - Math.ceil(product.rating))}</div>
                    <span>(${product.reviews})</span>
                </div>
                <button class="add-to-cart" onclick="addToCart(${product.id})" ${product.inventory <= 0 ? 'disabled' : ''}>
                    ${product.inventory <= 0 ? 'Out of Stock' : 'Add to Cart'}
                </button>
            </div>
        `;
        productsGrid.appendChild(productCard);
    });
}

// Render products for catalog page
function renderCatalogProducts() {
    const filteredProducts = currentCategory === 'all'
        ? products
        : products.filter(product => product.category === currentCategory);

    const productsGrid = document.getElementById('catalogProductsGrid');
    productsGrid.innerHTML = '';

    if (filteredProducts.length === 0) {
        productsGrid.innerHTML = '<p style="text-align: center; grid-column: 1/-1; padding: 40px;">No products found in this category</p>';
        return;
    }

    filteredProducts.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.innerHTML = `
            <div class="product-image">
                <img src="${product.image}" alt="${product.name}">
                ${product.originalPrice ? `<div class="product-badge">Sale</div>` : ''}
            </div>
            <div class="product-info">
                <div class="product-category">${product.category}</div>
                <h3 class="product-title">${product.name}</h3>
                <div class="product-price">
                    <span class="current-price">₹${product.price.toLocaleString()}</span>
                    ${product.originalPrice ? `<span class="original-price">₹${product.originalPrice.toLocaleString()}</span>` : ''}
                </div>
                <div class="product-rating">
                    <div class="rating-stars">${'★'.repeat(Math.floor(product.rating))}${product.rating % 1 >= 0.5 ? '½' : ''}${'☆'.repeat(5 - Math.ceil(product.rating))}</div>
                    <span>(${product.reviews})</span>
                </div>
                <button class="add-to-cart" onclick="addToCart(${product.id})" ${product.inventory <= 0 ? 'disabled' : ''}>
                    ${product.inventory <= 0 ? 'Out of Stock' : 'Add to Cart'}
                </button>
            </div>
        `;
        productsGrid.appendChild(productCard);
    });
}

// Add to cart function
function addToCart(productId) {
    const product = products.find(p => p.id === productId);

    if (!product || product.inventory <= 0) {
        showNotification('This product is out of stock!', 'error');
        return;
    }

    const existingItem = cart.find(item => item.id === productId);

    if (existingItem) {
        if (existingItem.quantity >= product.inventory) {
            showNotification('Maximum inventory reached for this product!', 'warning');
            return;
        }
        existingItem.quantity += 1;
    } else {
        cart.push({
            ...product,
            quantity: 1
        });
    }

    updateCart();
    showNotification(`${product.name} added to cart!`);
}

// Update cart display
function updateCart() {
    updateCartCount();
    renderCartItems();
}

// Update cart count
function updateCartCount() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.querySelector('.cart-count').textContent = totalItems;
}

// Render cart items
function renderCartItems() {
    const cartItems = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');

    if (cart.length === 0) {
        cartItems.innerHTML = '<p style="text-align: center; padding: 20px;">Your cart is empty</p>';
        cartTotal.textContent = '₹0';
        return;
    }

    cartItems.innerHTML = '';
    let total = 0;

    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;

        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <div class="cart-item-image">
                <img src="${item.image}" alt="${item.name}">
            </div>
            <div class="cart-item-details">
                <div class="cart-item-title">${item.name}</div>
                <div class="cart-item-price">₹${item.price.toLocaleString()}</div>
                <div class="cart-item-actions">
                    <button class="quantity-btn" onclick="updateQuantity(${item.id}, -1)">-</button>
                    <input type="number" class="quantity-input" value="${item.quantity}" min="1" max="${item.inventory}" onchange="updateQuantity(${item.id}, 0, this.value)">
                    <button class="quantity-btn" onclick="updateQuantity(${item.id}, 1)">+</button>
                    <button class="remove-item" onclick="removeFromCart(${item.id})">Remove</button>
                </div>
            </div>
        `;
        cartItems.appendChild(cartItem);
    });

    cartTotal.textContent = `₹${total.toLocaleString()}`;
}

// Update quantity
function updateQuantity(productId, change, newValue) {
    const item = cart.find(item => item.id === productId);
    const product = products.find(p => p.id === productId);

    if (item && product) {
        if (change !== 0) {
            item.quantity += change;
        } else if (newValue !== undefined) {
            const newQuantity = parseInt(newValue) || 1;
            if (newQuantity > product.inventory) {
                showNotification(`Only ${product.inventory} items available!`, 'warning');
                item.quantity = product.inventory;
            } else {
                item.quantity = newQuantity;
            }
        }

        if (item.quantity <= 0) {
            removeFromCart(productId);
        } else {
            updateCart();
        }
    }
}

// Remove from cart
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    updateCart();
    showNotification('Item removed from cart');
}

// Show notification
function showNotification(message, type = 'success') {
    // Remove any existing notifications
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }

    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;

    document.body.appendChild(notification);

    // Show notification
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);

    // Hide after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// Update payment summary
function updatePaymentSummary() {
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    document.getElementById('paymentSubtotal').textContent = `₹${total.toLocaleString()}`;
    document.getElementById('paymentTotal').textContent = `₹${total.toLocaleString()}`;
}

// Process payment
function processPayment() {
    // Get selected payment method
    const selectedMethod = document.querySelector('.payment-method.active').dataset.method;
    
    // Validate payment details based on method
    let isValid = true;
    
    if (selectedMethod === 'card') {
        const cardNumber = document.getElementById('cardNumber').value;
        const expiryDate = document.getElementById('expiryDate').value;
        const cvv = document.getElementById('cvv').value;
        const cardholderName = document.getElementById('cardholderName').value;
        
        if (!cardNumber || !expiryDate || !cvv || !cardholderName) {
            showNotification('Please fill in all card details', 'error');
            isValid = false;
        } else if (!/^\d{4} \d{4} \d{4} \d{4}$/.test(cardNumber)) {
            showNotification('Please enter a valid card number', 'error');
            isValid = false;
        } else if (!/^\d{2}\/\d{2}$/.test(expiryDate)) {
            showNotification('Please enter a valid expiry date (MM/YY)', 'error');
            isValid = false;
        } else if (!/^\d{3}$/.test(cvv)) {
            showNotification('Please enter a valid CVV', 'error');
            isValid = false;
        }
    } else if (selectedMethod === 'upi') {
        const upiId = document.getElementById('upiId').value;
        if (!upiId) {
            showNotification('Please enter your UPI ID', 'error');
            isValid = false;
        }
    }
    
    if (!isValid) return;
    
    // Prepare payment data
    const paymentData = {
        method: selectedMethod,
        amount: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        items: cart
    };
    
    // Process payment through backend
    fetch('/api/process-payment', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(paymentData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Clear cart
            cart = [];
            updateCart();
            updateCartCount();
            
            // Close payment modal
            document.getElementById('paymentModal').style.display = 'none';
            
            // Show success message
            showNotification('Payment successful! Your order has been placed.', 'success');
        } else {
            showNotification(data.message || 'Payment failed. Please try again.', 'error');
            if ((data.message || '').toLowerCase().includes('log in')) {
                switchPage('login');
            }
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showNotification('Payment failed. Please try again.', 'error');
    });
}

// Format card number input
document.addEventListener('input', function(e) {
    if (e.target.id === 'cardNumber') {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 16) value = value.substring(0, 16);
        let formatted = '';
        for (let i = 0; i < value.length; i++) {
            if (i > 0 && i % 4 === 0) formatted += ' ';
            formatted += value[i];
        }
        e.target.value = formatted;
    }
    
    if (e.target.id === 'expiryDate') {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 4) value = value.substring(0, 4);
        if (value.length > 2) {
            value = value.substring(0, 2) + '/' + value.substring(2);
        }
        e.target.value = value;
    }
    
    if (e.target.id === 'cvv') {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 3) value = value.substring(0, 3);
        e.target.value = value;
    }
});
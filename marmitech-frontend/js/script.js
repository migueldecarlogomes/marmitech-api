const API_BASE = 'http://localhost:5167/api';

function getToken() {
    return sessionStorage.getItem('marmitech_token');
}

function getCurrentUser() {
    const raw = sessionStorage.getItem('marmitech_user');
    return raw ? JSON.parse(raw) : null;
}

function setSession(token, user) {
    sessionStorage.setItem('marmitech_token', token);
    sessionStorage.setItem('marmitech_user', JSON.stringify(user));
}

function clearSession() {
    sessionStorage.removeItem('marmitech_token');
    sessionStorage.removeItem('marmitech_user');
}

// ---------- Animação de revelar elementos ao rolar a página ----------
let revealObserver;

function observeReveal(root = document) {
    const els = root.querySelectorAll('.reveal:not(.visible)');
    if (!('IntersectionObserver' in window)) {
        els.forEach((el) => el.classList.add('visible'));
        return;
    }
    if (!revealObserver) {
        revealObserver = new IntersectionObserver((entries, obs) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    obs.unobserve(entry.target);
                }
            });
        }, { threshold: 0.15 });
    }
    els.forEach((el) => revealObserver.observe(el));
}

// ---------- Cardápio + Carrinho + Checkout ----------
(function () {
    const cart = [];

    const cardWrapper = document.getElementById('cardWrapper');
    const cartItemsEl = document.getElementById('cartItems');
    const cartTotalEl = document.getElementById('cartTotal');
    const cartCountEl = document.getElementById('cartCount');
    const cartDrawer = document.getElementById('cartDrawer');
    const cartOverlay = document.getElementById('cartOverlay');
    const cartToggle = document.getElementById('cartToggle');
    const cartClose = document.getElementById('cartClose');
    const cartCheckoutBtn = document.getElementById('cartCheckoutBtn');

    const checkoutOverlay = document.getElementById('checkoutOverlay');
    const checkoutClose = document.getElementById('checkoutClose');
    const checkoutForm = document.getElementById('checkoutForm');
    const checkoutSummary = document.getElementById('checkoutSummary');
    const checkoutSuccess = document.getElementById('checkoutSuccess');
    const successName = document.getElementById('successName');
    const successTotal = document.getElementById('successTotal');
    const checkoutDoneBtn = document.getElementById('checkoutDoneBtn');

    function formatPrice(value) {
        return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    }

    function getTotal() {
        return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    }

    function updateCartCount() {
        const count = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCountEl.textContent = count;
    }

    function renderCart() {
        updateCartCount();
        cartTotalEl.textContent = formatPrice(getTotal());
        cartCheckoutBtn.disabled = cart.length === 0;

        if (cart.length === 0) {
            cartItemsEl.innerHTML = '<p class="cart-empty">Seu carrinho está vazio.</p>';
            return;
        }

        cartItemsEl.innerHTML = cart.map((item, index) => `
            <div class="cart-item">
                <div class="cart-item-info">
                    <h4>${item.name}</h4>
                    <span>${formatPrice(item.price)}</span>
                </div>
                <div class="cart-item-actions">
                    <button class="qty-btn" type="button" data-action="decrease" data-index="${index}" aria-label="Diminuir quantidade">-</button>
                    <span class="qty-value">${item.quantity}</span>
                    <button class="qty-btn" type="button" data-action="increase" data-index="${index}" aria-label="Aumentar quantidade">+</button>
                    <button class="remove-btn" type="button" data-action="remove" data-index="${index}" aria-label="Remover item">&times;</button>
                </div>
            </div>
        `).join('');
    }

    function addToCart(product) {
        const existing = cart.find((item) => item.productId === product.id);
        if (existing) {
            existing.quantity += 1;
        } else {
            cart.push({ productId: product.id, name: product.name, price: product.price, quantity: 1 });
        }
        renderCart();
        openCart();
    }

    function openCart() {
        cartDrawer.classList.add('open');
        cartOverlay.classList.add('open');
    }

    function closeCart() {
        cartDrawer.classList.remove('open');
        cartOverlay.classList.remove('open');
    }

    async function loadCatalog() {
        try {
            const res = await fetch(`${API_BASE}/products`);
            if (!res.ok) throw new Error('Falha ao carregar cardápio');
            const products = await res.json();
            renderCatalog(products);
        } catch (err) {
            cardWrapper.innerHTML = '<p class="catalog-loading">Não foi possível carregar o cardápio. Verifique se a API está rodando em ' + API_BASE + '.</p>';
            console.error(err);
        }
    }

    function renderCatalog(products) {
        cardWrapper.innerHTML = products.map((p) => `
            <div class="card-item reveal" data-id="${p.id}">
                <img src="${p.imageUrl}" alt="${p.name}">
                <div class="card-content">
                    <h3>${p.name}</h3>
                    <p>${p.description}</p>
                    <span class="card-price">${formatPrice(p.price)}</span>
                    <button type="button">Adicionar ao carrinho</button>
                </div>
            </div>
        `).join('');

        cardWrapper.querySelectorAll('.card-item').forEach((card) => {
            const button = card.querySelector('button[type="button"]');
            button.addEventListener('click', () => {
                const product = products.find((p) => p.id === Number(card.dataset.id));
                addToCart(product);
            });
        });

        observeReveal(cardWrapper);
    }

    function openCheckout() {
        if (cart.length === 0) return;

        const currentUser = getCurrentUser();
        if (currentUser) {
            checkoutForm.elements['name'].value = currentUser.name;
        }

        checkoutSummary.innerHTML = cart.map((item) => `
            <div class="checkout-summary-item">
                <span>${item.quantity}x ${item.name}</span>
                <span>${formatPrice(item.price * item.quantity)}</span>
            </div>
        `).join('') + `
            <div class="checkout-summary-total">
                <span>Total</span>
                <span>${formatPrice(getTotal())}</span>
            </div>
        `;

        checkoutForm.hidden = false;
        checkoutSuccess.hidden = true;
        checkoutOverlay.classList.add('open');
        closeCart();
    }

    function closeCheckout() {
        checkoutOverlay.classList.remove('open');
    }

    cartToggle.addEventListener('click', openCart);
    cartClose.addEventListener('click', closeCart);
    cartOverlay.addEventListener('click', closeCart);
    checkoutClose.addEventListener('click', closeCheckout);

    cartCheckoutBtn.addEventListener('click', () => {
        const currentUser = getCurrentUser();
        if (!currentUser) {
            closeCart();
            window.MarmitechAuth.requireLogin();
            return;
        }
        openCheckout();
    });

    cartItemsEl.addEventListener('click', (event) => {
        const btn = event.target.closest('button');
        if (!btn) return;
        const index = Number(btn.dataset.index);
        const action = btn.dataset.action;

        if (action === 'increase') {
            cart[index].quantity += 1;
        } else if (action === 'decrease') {
            cart[index].quantity -= 1;
            if (cart[index].quantity <= 0) cart.splice(index, 1);
        } else if (action === 'remove') {
            cart.splice(index, 1);
        }
        renderCart();
    });

    checkoutForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const token = getToken();
        if (!token) {
            closeCheckout();
            window.MarmitechAuth.requireLogin();
            return;
        }

        const payload = {
            customerName: checkoutForm.elements['name'].value,
            deliveryAddress: checkoutForm.elements['address'].value,
            paymentMethod: checkoutForm.elements['payment'].value,
            items: cart.map((item) => ({ productId: item.productId, quantity: item.quantity }))
        };

        const submitBtn = checkoutForm.querySelector('.checkout-submit');
        submitBtn.disabled = true;

        try {
            const res = await fetch(`${API_BASE}/orders`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (res.status === 401) {
                clearSession();
                closeCheckout();
                window.MarmitechAuth.updateUI();
                window.MarmitechAuth.requireLogin();
                return;
            }

            if (!res.ok) {
                const error = await res.json().catch(() => ({}));
                alert(error.message || 'Não foi possível finalizar o pedido.');
                return;
            }

            const order = await res.json();

            successName.textContent = order.customerName;
            successTotal.textContent = formatPrice(order.total);
            checkoutForm.hidden = true;
            checkoutSuccess.hidden = false;
            cart.length = 0;
            renderCart();
        } catch (err) {
            console.error(err);
            alert('Erro de conexão com o servidor. A API está rodando?');
        } finally {
            submitBtn.disabled = false;
        }
    });

    checkoutDoneBtn.addEventListener('click', () => {
        closeCheckout();
        checkoutForm.reset();
    });

    loadCatalog();
})();

// ---------- Autenticação ----------
(function () {
    const authOverlay = document.getElementById('authOverlay');
    const authToggle = document.getElementById('authToggle');
    const authClose = document.getElementById('authClose');
    const loginTab = document.getElementById('loginTab');
    const signupTab = document.getElementById('signupTab');
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const loginError = document.getElementById('loginError');
    const signupError = document.getElementById('signupError');
    const accountMenu = document.getElementById('accountMenu');
    const logoutBtn = document.getElementById('logoutBtn');

    function showError(el, message) {
        el.textContent = message;
        el.hidden = false;
    }

    function hideErrors() {
        loginError.hidden = true;
        signupError.hidden = true;
    }

    function updateAuthUI() {
        const user = getCurrentUser();
        if (user) {
            authToggle.textContent = `Olá, ${user.name.split(' ')[0]}`;
        } else {
            authToggle.textContent = 'Login';
            accountMenu.hidden = true;
        }
    }

    function openAuth() {
        hideErrors();
        loginForm.reset();
        signupForm.reset();
        authOverlay.classList.add('open');
    }

    function closeAuth() {
        authOverlay.classList.remove('open');
    }

    function switchTab(tab) {
        const isLogin = tab === 'login';
        loginTab.classList.toggle('active', isLogin);
        signupTab.classList.toggle('active', !isLogin);
        loginForm.hidden = !isLogin;
        signupForm.hidden = isLogin;
        hideErrors();
    }

    authToggle.addEventListener('click', () => {
        if (getCurrentUser()) {
            accountMenu.hidden = !accountMenu.hidden;
        } else {
            switchTab('login');
            openAuth();
        }
    });

    authClose.addEventListener('click', closeAuth);
    authOverlay.addEventListener('click', (event) => {
        if (event.target === authOverlay) closeAuth();
    });

    loginTab.addEventListener('click', () => switchTab('login'));
    signupTab.addEventListener('click', () => switchTab('signup'));

    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        hideErrors();

        const email = loginForm.elements['email'].value.trim().toLowerCase();
        const password = loginForm.elements['password'].value;

        try {
            const res = await fetch(`${API_BASE}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            if (!res.ok) {
                const error = await res.json().catch(() => ({}));
                showError(loginError, error.message || 'E-mail ou senha inválidos.');
                return;
            }

            const data = await res.json();
            setSession(data.token, { id: data.userId, name: data.name, email: data.email });
            updateAuthUI();
            closeAuth();
        } catch (err) {
            showError(loginError, 'Erro de conexão com o servidor. A API está rodando?');
        }
    });

    signupForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        hideErrors();

        const name = signupForm.elements['name'].value.trim();
        const email = signupForm.elements['email'].value.trim().toLowerCase();
        const password = signupForm.elements['password'].value;
        const confirmPassword = signupForm.elements['confirmPassword'].value;

        if (password !== confirmPassword) {
            showError(signupError, 'As senhas não coincidem.');
            return;
        }

        try {
            const res = await fetch(`${API_BASE}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password })
            });

            if (!res.ok) {
                const error = await res.json().catch(() => ({}));
                showError(signupError, error.message || 'Não foi possível criar a conta.');
                return;
            }

            const data = await res.json();
            setSession(data.token, { id: data.userId, name: data.name, email: data.email });
            updateAuthUI();
            closeAuth();
        } catch (err) {
            showError(signupError, 'Erro de conexão com o servidor. A API está rodando?');
        }
    });

    logoutBtn.addEventListener('click', () => {
        clearSession();
        accountMenu.hidden = true;
        updateAuthUI();
    });

    document.addEventListener('click', (event) => {
        if (!accountMenu.hidden && !event.target.closest('.auth-area')) {
            accountMenu.hidden = true;
        }
    });

    window.MarmitechAuth = {
        getCurrentUser,
        updateUI: updateAuthUI,
        requireLogin: function () {
            switchTab('login');
            openAuth();
        }
    };

    updateAuthUI();
})();

// ---------- Ativa a animação nos elementos estáticos da página (títulos, etc.) ----------
observeReveal(document);
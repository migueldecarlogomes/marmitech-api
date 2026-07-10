(function () {
    const cart = [];

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

    function addToCart(name, price) {
        const existing = cart.find((item) => item.name === name);
        if (existing) {
            existing.quantity += 1;
        } else {
            cart.push({ name, price, quantity: 1 });
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

    function openCheckout() {
        if (cart.length === 0) return;

        const currentUser = window.MarmitechAuth && window.MarmitechAuth.getCurrentUser();
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

    document.querySelectorAll('.card-item').forEach((card) => {
        const button = card.querySelector('button[type="button"]');
        if (!button) return;
        button.addEventListener('click', () => {
            const name = card.dataset.name;
            const price = parseFloat(card.dataset.price);
            addToCart(name, price);
        });
    });

    cartToggle.addEventListener('click', openCart);
    cartClose.addEventListener('click', closeCart);
    cartOverlay.addEventListener('click', closeCart);
    checkoutClose.addEventListener('click', closeCheckout);

    cartCheckoutBtn.addEventListener('click', () => {
        const currentUser = window.MarmitechAuth && window.MarmitechAuth.getCurrentUser();
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

    checkoutForm.addEventListener('submit', (event) => {
        event.preventDefault();
        successName.textContent = checkoutForm.elements['name'].value;
        successTotal.textContent = formatPrice(getTotal());
        checkoutForm.hidden = true;
        checkoutSuccess.hidden = false;
        cart.length = 0;
        renderCart();
    });

    checkoutDoneBtn.addEventListener('click', () => {
        closeCheckout();
        checkoutForm.reset();
    });
})();

(function () {
    const USERS_KEY = 'marmitech_users';
    const SESSION_KEY = 'marmitech_current_user';

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

    function getUsers() {
        try {
            return JSON.parse(localStorage.getItem(USERS_KEY)) || [];
        } catch (e) {
            return [];
        }
    }

    function saveUsers(users) {
        localStorage.setItem(USERS_KEY, JSON.stringify(users));
    }

    function getCurrentUser() {
        const email = localStorage.getItem(SESSION_KEY);
        if (!email) return null;
        return getUsers().find((user) => user.email === email) || null;
    }

    function setCurrentUser(email) {
        localStorage.setItem(SESSION_KEY, email);
    }

    function clearCurrentUser() {
        localStorage.removeItem(SESSION_KEY);
    }

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

    loginForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const email = loginForm.elements['email'].value.trim().toLowerCase();
        const password = loginForm.elements['password'].value;
        const user = getUsers().find((u) => u.email === email && u.password === password);

        if (!user) {
            showError(loginError, 'E-mail ou senha inválidos.');
            return;
        }

        setCurrentUser(user.email);
        updateAuthUI();
        closeAuth();
    });

    signupForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const name = signupForm.elements['name'].value.trim();
        const email = signupForm.elements['email'].value.trim().toLowerCase();
        const password = signupForm.elements['password'].value;
        const confirmPassword = signupForm.elements['confirmPassword'].value;

        if (password !== confirmPassword) {
            showError(signupError, 'As senhas não coincidem.');
            return;
        }

        const users = getUsers();
        if (users.some((u) => u.email === email)) {
            showError(signupError, 'Já existe uma conta com este e-mail.');
            return;
        }

        users.push({ name, email, password });
        saveUsers(users);
        setCurrentUser(email);
        updateAuthUI();
        closeAuth();
    });

    logoutBtn.addEventListener('click', () => {
        clearCurrentUser();
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
        requireLogin: function () {
            switchTab('login');
            openAuth();
        }
    };

    updateAuthUI();
})();

(function () {
    const revealEls = document.querySelectorAll('.reveal');
    if (!('IntersectionObserver' in window) || revealEls.length === 0) {
        revealEls.forEach((el) => el.classList.add('visible'));
        return;
    }

    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                obs.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15 });

    revealEls.forEach((el) => observer.observe(el));
})();

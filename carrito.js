document.addEventListener('DOMContentLoaded', function() {
        const CART_KEY = 'sc_cart';

        function getCart() {
        return JSON.parse(localStorage.getItem(CART_KEY) || '[]');
        }
        function saveCart(cart) {
        localStorage.setItem(CART_KEY, JSON.stringify(cart));
        }
        function findCartItem(cart, id, size) {
        return cart.find(item => item.id === id && item.size === size);
        }
        function updateCartBadge() {
        const badge = document.getElementById('cart-badge');
        if (badge) {
            const cart = getCart();
            badge.textContent = cart.reduce((sum, item) => sum + item.qty, 0);
            badge.classList.toggle('hidden', cart.length === 0);
        }
        }
        function toggleNequiBtn() {
        const cart = getCart();
        const btn = document.getElementById('nequi-pay-btn');
        if (btn) btn.style.display = cart.length ? 'flex' : 'none';
        }
        function showToast(msg) {
        let toast = document.getElementById('cart-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'cart-toast';
            toast.className = 'fixed bottom-20 right-6 bg-black text-white px-6 py-3 rounded shadow-lg z-50';
            document.body.appendChild(toast);
        }
        toast.textContent = msg;
        toast.style.display = 'block';
        setTimeout(() => { toast.style.display = 'none'; }, 2000);
        }

        // Añadir producto
        document.querySelectorAll('.add-to-cart').forEach(btn => {
        btn.addEventListener('click', function() {
            const product = JSON.parse(this.getAttribute('data-product'));
            let cart = getCart();
            let item = findCartItem(cart, product.id, product.size);
            if (item) {
            item.qty += 1;
            } else {
            cart.push({...product, qty: 1});
            }
            saveCart(cart);
            updateCartBadge();
            toggleNequiBtn();
            showToast('Producto añadido al carrito');
            renderCart();
        });
        });

        // Renderiza el carrito
        function renderCart() {
        const cart = getCart();
        const container = document.getElementById('cart-items');
        if (!container) return;
        if (!cart.length) {
            container.innerHTML = '<p class="text-center text-gray-400">Tu carrito está vacío.</p>';
            document.getElementById('cart-summary').style.display = 'none';
            return;
        }
        let html = '';
        cart.forEach((item, idx) => {
            html += `
            <div class="flex items-center justify-between bg-gray-900 rounded-lg p-4 shadow">
                <div class="flex items-center space-x-4">
                <img src="${item.image}" alt="${item.name}" class="w-16 h-16 rounded object-cover">
                <div>
                    <h3 class="font-semibold text-lg">${item.name}</h3>
                    ${item.size ? `<p class="text-gray-400 text-sm">Talla: ${item.size}</p>` : ''}
                </div>
                </div>
                <div class="flex items-center space-x-2">
                <button class="qty-btn px-2 py-1 bg-gray-700 text-white rounded" data-idx="${idx}" data-action="dec">-</button>
                <span class="font-bold">${item.qty}</span>
                <button class="qty-btn px-2 py-1 bg-gray-700 text-white rounded" data-idx="${idx}" data-action="inc">+</button>
                <span class="font-bold text-red-500">$${(item.price * item.qty).toLocaleString()}</span>
                <button class="remove-btn text-gray-400 hover:text-red-600 transition" data-idx="${idx}" title="Eliminar">
                    <i class="fas fa-trash"></i>
                </button>
                </div>
            </div>
            `;
        });
        container.innerHTML = html;
        document.getElementById('cart-summary').style.display = 'block';
        updateCartTotals();
        }
        function updateCartTotals() {
        const cart = getCart();
        const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
        const envio = subtotal > 120000 ? 0 : (subtotal > 0 ? 9000 : 0);
        //const envio = 0;
        const total = subtotal + envio;
        document.getElementById('cart-subtotal').textContent = '$' + subtotal.toLocaleString();
        document.getElementById('cart-envio').textContent = envio ? '$' + envio.toLocaleString() : 'Gratis';
        document.getElementById('cart-total').textContent = '$' + total.toLocaleString();
        }
        document.getElementById('cart-items').addEventListener('click', function(e) {
        const idx = e.target.closest('[data-idx]')?.getAttribute('data-idx');
        if (e.target.closest('.qty-btn')) {
            const action = e.target.closest('.qty-btn').getAttribute('data-action');
            let cart = getCart();
            if (action === 'inc') cart[idx].qty++;
            if (action === 'dec' && cart[idx].qty > 1) cart[idx].qty--;
            saveCart(cart);
            renderCart();
            updateCartBadge();
            toggleNequiBtn();
        }
        if (e.target.closest('.remove-btn')) {
            let cart = getCart();
            cart.splice(idx, 1);
            saveCart(cart);
            renderCart();
            updateCartBadge();
            toggleNequiBtn();
        }
        });
        window.addEventListener('storage', () => {
        renderCart();
        updateCartBadge();
        toggleNequiBtn();
        });
        renderCart();
        updateCartBadge();
        toggleNequiBtn();

        // Modal Nequi
        document.getElementById('checkout-btn').onclick = function(e) {
        e.preventDefault();
        const total = document.getElementById('cart-total').textContent;
        document.getElementById('nequi-total').textContent = total;
        document.getElementById('nequi-modal').classList.remove('hidden');
        };
        document.getElementById('nequi-form').onsubmit = async function(e) {
        e.preventDefault();
        const form = e.target;
        if (!form.nombre.value || !form.direccion.value || !form.telefono.value || !form.codigo.value || !form.captura.files.length) {
            document.getElementById('nequi-msg').textContent = 'Por favor, completa todos los campos obligatorios.';
            return;
        }
        document.getElementById('nequi-msg').innerHTML = '<span class="text-green-600 font-bold">¡Gracias por tu compra! Te enviaremos un correo de confirmación y tu número de seguimiento pronto.</span>';
        localStorage.removeItem(CART_KEY);
        setTimeout(() => {
            document.getElementById('nequi-modal').classList.add('hidden');
            window.location.reload();
        }, 3000);
    };
});
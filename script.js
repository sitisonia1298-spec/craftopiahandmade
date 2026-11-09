document.addEventListener("DOMContentLoaded", function () { // INISIALISASI / DOM LOAD

    // DATA PRODUK
    const products = [
        { name: "Keychain Mirror", price: 15000 },
        { name: "Mini Flower", price: 45000 },
        { name: "3D Caricature Frame", price: 150000 },
        { name: "3D Caricature Frame", price: 150000 },
        { name: "3D Art Frame Custom", price: 100000 },
        { name: "3D Art Frame Floral", price: 100000 }
    ];

    // VARIABEL CART
    let cart = [];
    try {
        const savedCart = JSON.parse(localStorage.getItem("craftopiaCart") || "[]");
        if (Array.isArray(savedCart)) {
            cart = savedCart.filter(item =>
                products.some(product => product.name === item.name && product.price === item.price) &&
                Number.isInteger(item.quantity) && item.quantity > 0
            );
        }
    } catch (error) {
        cart = [];
    }

    function saveCart() {
        try { localStorage.setItem("craftopiaCart", JSON.stringify(cart)); }
        catch (error) { /* Browser may restrict local storage */ }
    }

    // Tombol Masukkan Keranjang pada halaman katalog.
    document.querySelectorAll(".catalog-add-cart").forEach(function (button) {
        button.addEventListener("click", function () {
            addToCart(Number(button.dataset.productId));
        });
    });

    // MEMBUAT BUTTON ORDER NOW
    const productCards = document.querySelectorAll(".product-card");

    productCards.forEach(function (card, index) {
        const button = document.createElement("button");
        button.className = "btn order-btn";
        button.textContent = "Masukkan Keranjang";

        button.addEventListener("click", function () {
            addToCart(index);
        });

        card.appendChild(button);
    });

    const nav = document.querySelector("nav");

    // MEMBUAT BUTTON CART
    const cartButton = document.createElement("button");
    cartButton.className = "cart-button";
    cartButton.innerHTML = "🛒 Keranjang <span id='cart-count'>0</span>"; // ANGKA 0 AKAN BERUBAH SESUAI JUMLAH BARANG YG DIMASUKKAN KE DALAM CART
    nav.appendChild(cartButton); // BUTTON DIMASUKKAN KE NAVBAR

    const cartOverlay = document.createElement("div"); // MEMBUAT TAMPILAN ISI CART KETIKA DIKLIK
    cartOverlay.className = "cart-overlay";
    cartOverlay.innerHTML = `
        <div class="cart-modal">
            <button class="close-cart" id="close-cart">&times;</button>
            <h2>Keranjang Craftopia</h2>
            <div id="cart-items"></div>
            <div class="cart-summary">
                <strong>Total:</strong>
                <span id="cart-total">Rp0</span>
            </div>
            <button class="checkout-btn" id="checkout-btn">
                Checkout via WhatsApp
            </button>
        </div>
    `;
    document.body.appendChild(cartOverlay);

    // MEMBUKA DAN MENUTUP KERANJANG
    cartButton.addEventListener("click", function () {
        cartOverlay.classList.add("active"); // HUBUNGAN DENGAN CSS
        renderCart();
    });

    document.getElementById("close-cart").addEventListener("click", function () {
        cartOverlay.classList.remove("active");
    });

    cartOverlay.addEventListener("click", function (event) {
        if (event.target === cartOverlay) {
            cartOverlay.classList.remove("active");
        }
    });

    // MENCARI PRODUK BERDASARKAN INDEX DAN MENGECEK DI CART
    function addToCart(productIndex) {
        const product = products[productIndex];
        if (!product) return;
        const existing = cart.find(item => item.name === product.name);

        if (existing) {
            existing.quantity++; // KALAU SUDAH ADA PRODUK, MAKA JUMLAHNYA BERTAMBAH
        } else {
            // KALAU BELUM ADA, MAKA PRODUK BARU DIMASUKKAN
            cart.push({
                name: product.name,
                price: product.price,
                quantity: 1
            });
        }

        updateCartCount();
        showNotification(product.name + " berhasil ditambahkan ke keranjang.");
    }

    // MENGHITUNG JUMLAH SELURUH BARANG DI CART
    function updateCartCount() {
        saveCart();
        const count = cart.reduce((total, item) => total + item.quantity, 0);
        document.getElementById("cart-count").textContent = count;
    }

    updateCartCount();

    // MENAMPILKAN ISI CART KE LAYAR
    function renderCart() {
        const cartItems = document.getElementById("cart-items");
        const cartTotal = document.getElementById("cart-total");

        cartItems.innerHTML = "";

        if (cart.length === 0) {
            cartItems.innerHTML = `<p class="empty-cart">Keranjang kamu masih kosong.</p>`;
            cartTotal.textContent = "Rp0";
            return;
        }

        let total = 0;

        cart.forEach(function (item, index) {
            const subtotal = item.price * item.quantity; // MENGHITUNG SUBTOTAL PRODUK
            total += subtotal;

            const element = document.createElement("div");
            element.className = "cart-item";

            element.innerHTML = `
                <div class="cart-item-info">
                    <h3>${item.name}</h3>
                    <p>${formatRupiah(item.price)}</p>
                </div>
                <div class="cart-controls">
                    <button class="quantity-btn decrease">−</button>
                    <span>${item.quantity}</span>
                    <button class="quantity-btn increase">+</button>
                    <button class="remove-btn">Hapus</button>
                </div>
            `;

            // MEMBUAT KONTROL +, -, DAN HAPUS
            element.querySelector(".decrease").addEventListener("click", function () {
                if (cart[index].quantity > 1) {
                    cart[index].quantity--;
                } else {
                    cart.splice(index, 1);
                }
                updateCartCount();
                renderCart();
            });

            element.querySelector(".increase").addEventListener("click", function () {
                cart[index].quantity++;
                updateCartCount();
                renderCart();
            });

            element.querySelector(".remove-btn").addEventListener("click", function () {
                const name = cart[index].name;
                cart.splice(index, 1);
                updateCartCount();
                renderCart();
                showNotification(name + " dihapus dari keranjang.");
            });

            cartItems.appendChild(element);
        });

        cartTotal.textContent = formatRupiah(total);
    }

    function formatRupiah(number) { // FORMAT HARGA RUPIAH
        return "Rp" + number.toLocaleString("id-ID");
    }

    // NOTIFIKASI
    function showNotification(message) {
        const notification = document.createElement("div");
        notification.className = "cart-notification";
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => notification.classList.add("show"), 10);

        setTimeout(() => {
            notification.classList.remove("show");
            setTimeout(() => notification.remove(), 300);
        }, 2200);
    }

    // CHECKOUT KE WHATSAPP
    document.getElementById("checkout-btn").addEventListener("click", function () {
        if (cart.length === 0) {
            showNotification("Keranjang masih kosong.");
            return;
        }

        const phoneNumber = "62882020710662";
        let message = "Haloo Craftopia, aku mau order ini nih:%0A%0A";

        cart.forEach(function (item) {
            message += "- " + item.name + " x" + item.quantity +
                " = " + formatRupiah(item.price * item.quantity) + "%0A";
        });

        const total = cart.reduce(
            (sum, item) => sum + item.price * item.quantity, 0
        );

        message += "%0ATotal: " + formatRupiah(total);

        window.open(
            "https://wa.me/" + phoneNumber + "?text=" + message,
            "_blank"
        );
    });
});

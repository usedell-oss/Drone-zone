/**
 * ============================================================================
 * DRONEZONE - MULTI-LANGUAGE ULTRA PREMIUM PLATFORM
 * ============================================================================
 */

const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'products_db.json');
const ADMIN_TOKEN = "admin123";

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

const initialProducts = [
    {
        id: "1689000000001",
        name: "DJI Avata 2 Pro Combo",
        category: "drones",
        price: 1299,
        image: "https://images.unsplash.com/photo-1527977966376-1c8408f9f108?auto=format&fit=crop&w=800&q=80",
        description: "4K/60fps HDR Ultra-Wide FPV Drone with Motion Controller and Goggles 3."
    },
    {
        id: "1689000000002",
        name: "Custom 7-inch Long Range FPV",
        category: "drones",
        price: 850,
        image: "https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=800&q=80",
        description: "High-efficiency GPS long-range frame with F7 FC and 60A ESC stack."
    },
    {
        id: "1689000000003",
        name: "Brushless Motor 2207 1960KV",
        category: "motors",
        price: 95,
        image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80",
        description: "Extreme durable alloy stator motors for 5-inch and 6-inch freestyle rigs."
    }
];

function readDatabase() {
    if (!fs.existsSync(DATA_FILE)) {
        fs.writeFileSync(DATA_FILE, JSON.stringify(initialProducts, null, 2));
        return initialProducts;
    }
    try {
        const raw = fs.readFileSync(DATA_FILE, 'utf8');
        return JSON.parse(raw);
    } catch (err) {
        return initialProducts;
    }
}

function writeDatabase(data) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// RESTful API
app.get('/api/products', (req, res) => {
    res.json({ success: true, data: readDatabase() });
});

app.post('/api/products', (req, res) => {
    const { authKey, name, category, price, image, description } = req.body;
    if (authKey !== ADMIN_TOKEN) {
        return res.status(401).json({ success: false, message: "Invalid Security Key!" });
    }
    if (!name || !price || !image) {
        return res.status(400).json({ success: false, message: "Please fill all required fields." });
    }
    const products = readDatabase();
    const newProduct = {
        id: Date.now().toString(),
        name,
        category: category || "parts",
        price: parseFloat(price),
        image,
        description: description || "High performance drone gear."
    };
    products.unshift(newProduct);
    writeDatabase(products);
    res.status(201).json({ success: true, message: "Product added successfully", data: newProduct });
});

app.delete('/api/products/:id', (req, res) => {
    const { authKey } = req.body;
    const { id } = req.params;
    if (authKey !== ADMIN_TOKEN) {
        return res.status(401).json({ success: false, message: "Invalid Security Key!" });
    }
    let products = readDatabase();
    const filtered = products.filter(p => p.id !== id);
    writeDatabase(filtered);
    res.json({ success: true, message: "Product deleted successfully" });
});

// Front-End SPA Integration
app.get('*', (req, res) => {
    res.send(`<!DOCTYPE html>
<html lang="en" dir="ltr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>DroneZone | Professional Drone Systems</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;900&family=Cairo:wght@400;700;900&display=swap" rel="stylesheet">
    <style>
        :root {
            --bg-body: #090d16;
            --bg-card: rgba(21, 30, 49, 0.7);
            --bg-glass: rgba(13, 19, 33, 0.85);
            --primary: #00f2fe;
            --primary-hover: #4facfe;
            --accent: #6366f1;
            --danger: #ef4444;
            --text-main: #f8fafc;
            --text-muted: #94a3b8;
            --border: rgba(255, 255, 255, 0.08);
            --shadow: 0 10px 30px -10px rgba(0, 242, 254, 0.25);
        }

        * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Inter', 'Cairo', sans-serif; transition: direction 0.3s; }
        body { background: var(--bg-body); color: var(--text-main); line-height: 1.6; overflow-x: hidden; min-height: 100vh; }

        /* Header */
        header {
            position: fixed; top: 0; left: 0; right: 0; z-index: 100;
            background: var(--bg-glass); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
            border-bottom: 1px solid var(--border); padding: 14px 6%;
            display: flex; justify-content: space-between; align-items: center;
        }
        .logo { font-size: 1.5rem; font-weight: 900; color: #fff; text-decoration: none; display: flex; align-items: center; gap: 8px; }
        .logo span { color: var(--primary); }

        .nav-actions { display: flex; align-items: center; gap: 12px; }

        .btn-lang {
            background: rgba(255, 255, 255, 0.08); color: var(--primary); border: 1px solid var(--border);
            padding: 8px 14px; border-radius: 10px; font-weight: 700; cursor: pointer; transition: 0.3s;
        }
        .btn-lang:hover { background: var(--primary); color: #000; }

        .cart-trigger {
            background: linear-gradient(135deg, var(--primary), var(--primary-hover));
            color: #000; border: none; padding: 10px 18px; border-radius: 12px; font-weight: 800;
            cursor: pointer; position: relative; display: flex; align-items: center; gap: 8px;
            box-shadow: var(--shadow); transition: transform 0.2s;
        }
        .cart-trigger:active { transform: scale(0.95); }
        .cart-badge {
            background: #000; color: #fff; border-radius: 50%; width: 22px; height: 22px;
            font-size: 0.75rem; font-weight: 900; display: flex; align-items: center; justify-content: center;
        }

        /* Hero Section */
        .hero {
            padding: 130px 6% 40px 6%; text-align: center;
            background: radial-gradient(circle at 50% 10%, rgba(0, 242, 254, 0.12) 0%, transparent 60%);
        }
        .hero h1 { font-size: 2.2rem; font-weight: 900; margin-bottom: 10px; line-height: 1.2; }
        .hero h1 span { color: var(--primary); }
        .hero p { color: var(--text-muted); font-size: 0.95rem; max-width: 500px; margin: 0 auto; }

        /* Container */
        .container { max-width: 1200px; margin: 0 auto; padding: 20px 6% 80px 6%; }

        /* Filter Bar */
        .filter-bar { display: flex; justify-content: center; gap: 10px; margin-bottom: 30px; flex-wrap: wrap; }
        .filter-btn {
            background: rgba(255, 255, 255, 0.04); color: var(--text-muted); border: 1px solid var(--border);
            padding: 8px 20px; border-radius: 30px; cursor: pointer; font-weight: 700; transition: 0.3s;
        }
        .filter-btn.active, .filter-btn:hover { background: var(--primary); color: #000; border-color: var(--primary); }

        /* Product Grid */
        .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 24px; }
        .card {
            background: var(--bg-card); border: 1px solid var(--border); border-radius: 20px;
            overflow: hidden; display: flex; flex-direction: column; justify-content: space-between;
            backdrop-filter: blur(10px); transition: transform 0.3s, border-color 0.3s;
        }
        .card:hover { transform: translateY(-5px); border-color: rgba(0, 242, 254, 0.4); }
        .card-img { width: 100%; height: 200px; object-fit: cover; background: #000; }
        .card-body { padding: 18px; flex: 1; display: flex; flex-direction: column; justify-content: space-between; }
        .card-category { font-size: 0.75rem; color: var(--primary); font-weight: 800; text-transform: uppercase; letter-spacing: 1px; }
        .card-title { font-size: 1.1rem; font-weight: 700; margin: 6px 0 12px 0; color: #fff; }
        .card-price { font-size: 1.4rem; font-weight: 900; color: #fff; margin-bottom: 14px; }
        .btn-add {
            background: rgba(255, 255, 255, 0.08); color: #fff; border: 1px solid var(--border);
            padding: 10px; border-radius: 12px; font-weight: 700; cursor: pointer; width: 100%;
            transition: 0.3s; text-align: center;
        }
        .btn-add:hover { background: var(--primary); color: #000; border-color: var(--primary); }

        /* Cart Drawer */
        .cart-overlay {
            position: fixed; inset: 0; background: rgba(0,0,0,0.8); backdrop-filter: blur(8px);
            z-index: 200; display: none; justify-content: flex-end;
        }
        .cart-drawer {
            width: 100%; max-width: 400px; background: #0d1322; height: 100%;
            padding: 24px; display: flex; flex-direction: column; justify-content: space-between;
            border-left: 1px solid var(--border);
        }
        html[dir="rtl"] .cart-drawer { border-left: none; border-right: 1px solid var(--border); }
        .btn-whatsapp {
            background: #25d366; color: #fff; font-weight: 800; padding: 14px;
            border-radius: 12px; border: none; cursor: pointer; width: 100%; font-size: 1rem;
            display: flex; align-items: center; justify-content: center; gap: 8px;
        }

        /* Hidden Admin Panel */
        .admin-trigger {
            text-align: center; margin-top: 60px; color: var(--text-muted); font-size: 0.85rem;
            cursor: pointer; opacity: 0.5; transition: opacity 0.2s;
        }
        .admin-trigger:hover { opacity: 1; color: var(--primary); }
        .admin-box {
            display: none; background: #0b111e; border: 1px solid var(--primary); border-radius: 20px;
            padding: 24px; margin-top: 30px; animation: fadeIn 0.4s ease;
        }
        .form-control {
            width: 100%; background: #05080f; border: 1px solid var(--border); color: #fff;
            padding: 12px; border-radius: 10px; margin-bottom: 12px; font-size: 0.9rem; outline: none;
        }

        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    </style>
</head>
<body>

    <header>
        <a href="#" class="logo">✈ DRONE<span>ZONE</span></a>
        <div class="nav-actions">
            <button class="btn-lang" onclick="toggleLanguage()" id="lang-btn">العربية 🌐</button>
            <button class="cart-trigger" onclick="toggleCart()">
                🛒 <span id="cart-title-text">Cart</span> <span id="cart-count" class="cart-badge">0</span>
            </button>
        </div>
    </header>

    <section class="hero">
        <h1 id="hero-title">Professional <span>Drone Systems</span></h1>
        <p id="hero-desc">Discover high-performance FPV drones, precision motors, and premium gear.</p>
    </section>

    <section class="container">
        <div class="filter-bar">
            <button class="filter-btn active" onclick="filterCat('all', this)" id="cat-all">All Products</button>
            <button class="filter-btn" onclick="filterCat('drones', this)" id="cat-drones">RTF Drones</button>
            <button class="filter-btn" onclick="filterCat('motors', this)" id="cat-motors">Motors</button>
            <button class="filter-btn" onclick="filterCat('parts', this)" id="cat-parts">Spare Parts</button>
        </div>

        <div id="product-grid" class="grid">Loading products...</div>

        <!-- Hidden Admin Activation Button -->
        <div class="admin-trigger" onclick="activateAdmin()" id="admin-trigger-text">🔒 Admin Control Panel</div>

        <!-- Hidden Admin Panel -->
        <div id="admin-panel" class="admin-box">
            <h3 style="color: var(--primary); margin-bottom: 14px;" id="admin-heading">🛠️ Store Admin Panel</h3>
            <form onsubmit="handleApiAdd(event)">
                <input type="password" id="api-key" class="form-control" value="admin123" placeholder="Security Key" required>
                <input type="text" id="api-name" class="form-control" placeholder="Product Original Name (English)" required>
                <select id="api-cat" class="form-control">
                    <option value="drones">RTF Drones</option>
                    <option value="motors">Motors</option>
                    <option value="parts">Spare Parts</option>
                </select>
                <input type="number" id="api-price" class="form-control" placeholder="Price ($)" required>
                <input type="url" id="api-img" class="form-control" placeholder="Product Image URL" required>
                <button type="submit" class="btn-add" style="background: var(--primary); color:#000; font-weight:800; margin-top:8px;" id="admin-add-btn">+ Add Product</button>
            </form>
            <div id="admin-items-list" style="margin-top: 20px;"></div>
        </div>
    </section>

    <!-- Cart Drawer Modal -->
    <div id="cart-modal" class="cart-overlay">
        <div class="cart-drawer">
            <div>
                <div style="display: flex; justify-content: space-between; border-bottom: 1px solid var(--border); padding-bottom: 12px;">
                    <h3 style="color: #fff;" id="cart-drawer-title">Shopping Cart</h3>
                    <button onclick="toggleCart()" style="background:none; border:none; color:#fff; font-size:1.4rem; cursor:pointer;">✕</button>
                </div>
                <div id="cart-list" style="margin-top: 20px;"></div>
            </div>
            <div>
                <div style="display: flex; justify-content: space-between; font-weight: 800; font-size: 1.2rem; margin-bottom: 16px;">
                    <span id="cart-total-label">Total:</span>
                    <span id="cart-total" style="color: var(--primary);">$0</span>
                </div>
                <button onclick="checkoutWhatsApp()" class="btn-whatsapp" id="btn-wa-text">Checkout via WhatsApp 📲</button>
            </div>
        </div>
    </div>

    <script>
        var allProducts = [];
        var cart = [];
        var currentLang = 'en';

        var i18n = {
            en: {
                langBtn: "العربية 🌐",
                cartTitle: "Cart",
                heroTitle: 'Professional <span>Drone Systems</span>',
                heroDesc: "Discover high-performance FPV drones, precision motors, and premium gear.",
                catAll: "All Products",
                catDrones: "RTF Drones",
                catMotors: "Motors",
                catParts: "Spare Parts",
                addCart: "Add to Cart 🛒",
                cartDrawerTitle: "Shopping Cart",
                cartEmpty: "Your cart is currently empty.",
                cartTotalLabel: "Total:",
                btnWa: "Checkout via WhatsApp 📲",
                adminTrigger: "🔒 Admin Control Panel",
                adminHeading: "🛠️ Store Admin Panel",
                adminAddBtn: "+ Add Product",
                deleteBtn: "Delete",
                askPass: "Enter Admin Password:",
                wrongPass: "Incorrect Password!",
                addedSuccess: "Product added successfully!",
                deletedSuccess: "Product deleted successfully!"
            },
            ar: {
                langBtn: "English 🌐",
                cartTitle: "السلة",
                heroTitle: 'أنظمة وطائرات <span>الدرون الاحترافية</span>',
                heroDesc: "اكتشف أفضل قطع ومعدات الدرون بأعلى جودة وأفضل الأسعار.",
                catAll: "الكل",
                catDrones: "طائرات كاملة",
                catMotors: "محركات",
                catParts: "قطع غيار",
                addCart: "إضافة إلى السلة 🛒",
                cartDrawerTitle: "سلة التسوق",
                cartEmpty: "السلة فارغة حالياً.",
                cartTotalLabel: "المجموع الإجمالي:",
                btnWa: "طلب عبر WhatsApp 📲",
                adminTrigger: "🔒 لوحة التحكم بالمتجر",
                adminHeading: "🛠️ لوحة إدارة المتجر",
                adminAddBtn: "+ إضافة للمتجر",
                deleteBtn: "حذف",
                askPass: "أدخل كلمة السر الخاصة بإدارة المتجر:",
                wrongPass: "كلمة السر غير صحيحة!",
                addedSuccess: "تمت إضافة المنتج بنجاح!",
                deletedSuccess: "تم الحذف بنجاح!"
            }
        };

        function toggleLanguage() {
            currentLang = currentLang === 'en' ? 'ar' : 'en';
            document.documentElement.lang = currentLang;
            document.documentElement.dir = currentLang === 'ar' ? 'rtl' : 'ltr';
            updateUI();
        }

        function updateUI() {
            var t = i18n[currentLang];
            document.getElementById('lang-btn').innerText = t.langBtn;
            document.getElementById('cart-title-text').innerText = t.cartTitle;
            document.getElementById('hero-title').innerHTML = t.heroTitle;
            document.getElementById('hero-desc').innerText = t.heroDesc;
            document.getElementById('cat-all').innerText = t.catAll;
            document.getElementById('cat-drones').innerText = t.catDrones;
            document.getElementById('cat-motors').innerText = t.catMotors;
            document.getElementById('cat-parts').innerText = t.catParts;
            document.getElementById('cart-drawer-title').innerText = t.cartDrawerTitle;
            document.getElementById('cart-total-label').innerText = t.cartTotalLabel;
            document.getElementById('btn-wa-text').innerText = t.btnWa;
            document.getElementById('admin-trigger-text').innerText = t.adminTrigger;
            document.getElementById('admin-heading').innerText = t.adminHeading;
            document.getElementById('admin-add-btn').innerText = t.adminAddBtn;
            
            renderProducts(allProducts);
            updateCart();
            renderAdminList(allProducts);
        }

        async function fetchProducts() {
            try {
                var res = await fetch('/api/products');
                var json = await res.json();
                if(json.success) {
                    allProducts = json.data;
                    renderProducts(allProducts);
                    renderAdminList(allProducts);
                }
            } catch(e) {
                document.getElementById('product-grid').innerHTML = "<p style='color:red;'>Failed to load products.</p>";
            }
        }

        function renderProducts(items) {
            var grid = document.getElementById('product-grid');
            var t = i18n[currentLang];
            if(!items.length) {
                grid.innerHTML = "<p style='color: var(--text-muted); text-align:center;'>" + t.cartEmpty + "</p>";
                return;
            }
            grid.innerHTML = items.map(function(p) {
                return '<div class="card">' +
                    '<img src="' + p.image + '" class="card-img" onerror="this.src=\\'https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=800&q=80\\'" />' +
                    '<div class="card-body">' +
                        '<div>' +
                            '<span class="card-category">' + p.category + '</span>' +
                            '<h4 class="card-title">' + p.name + '</h4>' +
                        '</div>' +
                        '<div>' +
                            '<div class="card-price">$' + p.price + '</div>' +
                            '<button onclick="addToCart(\\\'' + p.id + '\\\')" class="btn-add">' + t.addCart + '</button>' +
                        '</div>' +
                    '</div>' +
                '</div>';
            }).join('');
        }

        function filterCat(cat,

/**
 * ============================================================================
 * DRONEZONE FULL-STACK PLATFORM (Node.js + Express + Embedded UI)
 * ============================================================================
 * Architecture: REST API Back-End + Modern Responsive Single Page Application (SPA)
 * Compatible with Mobile Browsers, Local Node Runtime & Cloud Hosting (Render/Railway)
 */

const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'products_db.json');
const ADMIN_TOKEN = "admin123"; // Secret password for API write operations

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Default Database Seeding
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

// Helper Functions for Persistence
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

// ============================================================================
// BACK-END RESTful API ENDPOINTS
// ============================================================================

// Get all products
app.get('/api/products', (req, res) => {
    const products = readDatabase();
    res.json({ success: true, count: products.length, data: products });
});

// Add new product (Protected)
app.post('/api/products', (req, res) => {
    const { authKey, name, category, price, image, description } = req.body;

    if (authKey !== ADMIN_TOKEN) {
        return res.status(401).json({ success: false, message: "Unauthorized: Invalid Admin Token" });
    }

    if (!name || !price || !image) {
        return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    const products = readDatabase();
    const newProduct = {
        id: Date.now().toString(),
        name,
        category: category || "parts",
        price: parseFloat(price),
        image,
        description: description || "Professional grade drone hardware component."
    };

    products.unshift(newProduct);
    writeDatabase(products);

    res.status(201).json({ success: true, message: "Product added successfully", data: newProduct });
});

// Delete product (Protected)
app.delete('/api/products/:id', (req, res) => {
    const { authKey } = req.body;
    const { id } = req.params;

    if (authKey !== ADMIN_TOKEN) {
        return res.status(401).json({ success: false, message: "Unauthorized: Invalid Admin Token" });
    }

    let products = readDatabase();
    const filtered = products.filter(p => p.id !== id);

    if (products.length === filtered.length) {
        return res.status(404).json({ success: false, message: "Product not found" });
    }

    writeDatabase(filtered);
    res.json({ success: true, message: "Product deleted successfully" });
});

// ============================================================================
// FRONT-END SINGLE PAGE APPLICATION (UI / HTML + CSS + JS)
// ============================================================================

app.get('*', (req, res) => {
    res.send(`
<!DOCTYPE html>
<html lang="en" dir="ltr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>DroneZone | Pro Aerial Systems & Hardware</title>
    <style>
        :root {
            --bg-dark: #070a13;
            --bg-card: #0f172a;
            --bg-glass: rgba(15, 23, 42, 0.9);
            --border: #1e293b;
            --primary: #38bdf8;
            --primary-hover: #0284c7;
            --accent: #6366f1;
            --danger: #ef4444;
            --text-main: #f8fafc;
            --text-muted: #94a3b8;
        }

        * { box-sizing: border-box; margin: 0; padding: 0; font-family: system-ui, -apple-system, sans-serif; scroll-behavior: smooth; }
        body { background-color: var(--bg-dark); color: var(--text-main); line-height: 1.6; overflow-x: hidden; }

        header {
            position: fixed; top: 0; left: 0; right: 0; z-index: 100;
            background: var(--bg-glass); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
            border-bottom: 1px solid var(--border); padding: 14px 5%;
            display: flex; justify-content: space-between; align-items: center;
        }
        .logo { font-size: 1.4rem; font-weight: 900; color: #fff; text-decoration: none; }
        .logo span { color: var(--primary); }

        nav { display: flex; gap: 20px; }
        nav a { color: var(--text-muted); text-decoration: none; font-weight: 600; font-size: 0.9rem; transition: 0.2s; }
        nav a:hover { color: var(--primary); }

        .cart-trigger {
            background: #1e293b; border: 1px solid var(--border); color: #fff;
            padding: 8px 16px; border-radius: 10px; font-weight: 700; cursor: pointer; position: relative;
        }
        .cart-badge {
            position: absolute; top: -6px; right: -6px; background: var(--primary); color: #000;
            border-radius: 50%; width: 20px; height: 20px; font-size: 0.75rem; font-weight: 900;
            display: flex; align-items: center; justify-content: center;
        }

        .hero {
            padding: 140px 5% 60px 5%; text-align: center;
            background: radial-gradient(circle at 50% 20%, #1e293b 0%, var(--bg-dark) 70%);
        }
        .hero h1 { font-size: 2.8rem; font-weight: 900; margin-bottom: 16px; }
        .hero h1 span { color: var(--primary); }
        .hero p { color: var(--text-muted); max-width: 600px; margin: 0 auto 24px auto; }

        .btn-main {
            background: var(--primary); color: #000; font-weight: 800; padding: 12px 24px;
            border-radius: 10px; text-decoration: none; display: inline-block; border: none; cursor: pointer; transition: 0.2s;
        }
        .btn-main:hover { background: var(--primary-hover); color: #fff; }

        .container { max-width: 1100px; margin: 0 auto; padding: 40px 5%; }
        .sec-title { text-align: center; margin-bottom: 30px; }
        .sec-title h2 { font-size: 1.8rem; font-weight: 800; }

        .filter-bar { display: flex; justify-content: center; gap: 8px; margin-bottom: 24px; flex-wrap: wrap; }
        .filter-btn {
            background: var(--bg-card); color: var(--text-muted); border: 1px solid var(--border);
            padding: 8px 16px; border-radius: 8px; cursor: pointer; font-weight: 600;
        }
        .filter-btn.active { background: var(--primary); color: #000; font-weight: 800; }

        .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 20px; }
        .card {
            background: var(--bg-card); border: 1px solid var(--border); border-radius: 14px;
            overflow: hidden; display: flex; flex-direction: column; justify-content: space-between;
        }
        .card-img { width: 100%; height: 180px; object-fit: cover; background: #000; }
        .card-body { padding: 16px; flex: 1; display: flex; flex-direction: column; justify-content: space-between; }
        .card-price { font-size: 1.2rem; font-weight: 900; color: var(--primary); margin: 10px 0; }

        .admin-box {
            background: #0b1329; border: 2px dashed var(--primary); border-radius: 16px;
            padding: 24px; margin-top: 50px;
        }
        .form-control {
            width: 100%; background: var(--bg-dark); border: 1px solid var(--border); color: #fff;
            padding: 10px; border-radius: 8px; margin-bottom: 12px; font-size: 0.9rem; outline: none;
        }

        .cart-overlay {
            position: fixed; inset: 0; background: rgba(0,0,0,0.7); backdrop-filter: blur(4px);
            z-index: 200; display: none; justify-content: flex-end;
        }
        .cart-drawer {
            width: 100%; max-width: 380px; background: var(--bg-card); height: 100%;
            padding: 20px; display: flex; flex-direction: column; justify-content: space-between;
        }

        @media (max-width: 600px) {
            nav { display: none; }
            .hero h1 { font-size: 2rem; }
        }
    </style>
</head>
<body>

    <header>
        <a href="#" class="logo">✈ DRONE<span>ZONE</span></a>
        <nav>
            <a href="#shop">Store</a>
            <a href="#admin">Admin API</a>
        </nav>
        <button class="cart-trigger" onclick="toggleCart()">
            🛒 <span id="cart-count" class="cart-badge">0</span>
        </button>
    </header>

    <section class="hero">
        <h1>Next-Gen <span>Aerial Systems</span></h1>
        <p>Enterprise Full-Stack Store & High-Speed FPV Component Management.</p>
        <a href="#shop" class="btn-main">Browse Inventory ↓</a>
    </section>

    <section id="shop" class="container">
        <div class="sec-title">
            <h2>Hardware Inventory</h2>
        </div>

        <div class="filter-bar">
            <button class="filter-btn active" onclick="filterCat('all', this)">All</button>
            <button class="filter-btn" onclick="filterCat('drones', this)">RTF Drones</button>
            <button class="filter-btn" onclick="filterCat('motors', this)">Motors</button>
            <button class="filter-btn" onclick="filterCat('parts', this)">Parts</button>
        </div>

        <div id="product-grid" class="grid">Loading Back-End Data...</div>

        <!-- FULL BACK-END ADMIN INTEGRATION -->
        <div id="admin" class="admin-box">
            <h3 style="color: var(--primary); margin-bottom: 14px;">🔒 Full-Stack Back-End Admin Panel</h3>
            <p style="color: var(--text-muted); font-size: 0.85rem; margin-bottom: 16px;">
                إضافة وحذف المنتجات عبر الاتصال المباشر بـ REST API الخاص بالخادم.
            </p>
            <form onsubmit="handleApiAdd(event)">
                <input type="password" id="api-key" class="form-control" placeholder="Admin Security Key (Default: admin123)" required>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 10px;">
                    <input type="text" id="api-name" class="form-control" placeholder="Product Name" required>
                    <select id="api-cat" class="form-control">
                        <option value="drones">RTF Drones</option>
                        <option value="motors">Motors</option>
                        <option value="parts">Parts</option>
                    </select>
                    <input type="number" id="api-price" class="form-control" placeholder="Price ($)" required>
                    <input type="url" id="api-img" class="form-control" placeholder="Image URL" required>
                </div>
                <button type="submit" class="btn-main" style="width: 100%; margin-top: 8px;">+ Push to Back-End Server</button>
            </form>
            <div id="admin-items-list" style="margin-top: 20px;"></div>
        </div>
    </section>

    <!-- CART MODAL -->
    <div id="cart-modal" class="cart-overlay">
        <div class="cart-drawer">
            <div>
                <div style="display: flex; justify-content: space-between; border-bottom: 1px solid var(--border); padding-bottom: 12px;">
                    <h3>Cart Summary</h3>
                    <button onclick="toggleCart()" style="background:none; border:none; color:#fff; font-size:1.2rem; cursor:pointer;">✕</button>
                </div>
                <div id="cart-list" style="margin-top: 16px;"></div>
            </div>
            <div>
                <div style="display: flex; justify-content: space-between; font-weight: 800; font-size: 1.1rem; margin-bottom: 12px;">
                    <span>Total:</span>
                    <span id="cart-total" style="color: var(--primary);">$0</span>
                </div>
                <button onclick="checkoutWhatsApp()" class="btn-main" style="width: 100%;">Checkout via WhatsApp 📲</button>
            </div>
        </div>
    </div>

    <script>
        let allProducts = [];
        let cart = [];

        async function fetchProducts() {
            try {
                const res = await fetch('/api/products');
                const json = await res.json();
                if(json.success) {
                    allProducts = json.data;
                    renderProducts(allProducts);
                    renderAdminList(allProducts);
                }
            } catch(e) {
                document.getElementById('product-grid').innerHTML = "<p style='color:red;'>Failed to connect to Back-End server.</p>";
            }
        }

        function renderProducts(items) {
            const grid = document.getElementById('product-grid');
            if(!items.length) {
                grid.innerHTML = "<p style='color: var(--text-muted);'>No products found.</p>";
                return;
            }
            grid.innerHTML = items.map(p => \`
                <div class="card">
                    <img src="\${p.image}" class="card-img" onerror="this.src='https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=800&q=80'">
                    <div class="card-body">
                        <div>
                            <span style="font-size:0.7rem; color:var(--primary); font-weight:800; text-transform:uppercase;">\${p.category}</span>
                            <h4 style="font-size:1rem; margin-top:4px;">\${p.name}</h4>
                        </div>
                        <div>
                            <div class="card-price">\$\${p.price}</div>
                            <button onclick="addToCart('\${p.id}')" class="btn-main" style="width:100%; padding:8px; font-size:0.85rem;">+ Add To Cart</button>
                        </div>
                    </div>
                </div>
            \`).join('');
        }

        function filterCat(cat, btn) {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            if(cat === 'all') renderProducts(allProducts);
            else renderProducts(allProducts.filter(p => p.category === cat));
        }

        function addToCart(id) {
            const prod = allProducts.find(p => p.id === id);
            const exist = cart.find(c => c.id === id);
            if(exist) exist.qty++;
            else cart.push({ ...prod, qty: 1 });
            updateCart();
            toggleCart(true);
        }

        function updateCart() {
            const count = cart.reduce((s, i) => s + i.qty, 0);
            const total = cart.reduce((s, i) => s + (i.price * i.qty), 0);
            document.getElementById('cart-count').innerText = count;
            document.getElementById('cart-total').innerText = '$' + total;

            const list = document.getElementById('cart-list');
            if(!cart.length) list.innerHTML = "<p style='color:var(--text-muted); text-align:center;'>Cart is empty.</p>";
            else list.innerHTML = cart.map(i => \`
                <div style="display:flex; justify-content:space-between; margin-bottom:10px; border-bottom:1px solid var(--border); padding-bottom:8px;">
                    <div>
                        <div style="font-weight:700;">\${i.name}</div>
                        <div style="font-size:0.8rem; color:var(--primary);">\$\${i.price} x \${i.qty}</div>
                    </div>
                </div>
            \`).join('');
        }

        function toggleCart(open) {
            const m = document.getElementById('cart-modal');
            m.style.display = (open || m.style.display !== 'flex') ? 'flex' : 'none';
        }

        function checkoutWhatsApp() {
            if(!cart.length) return alert('السلة فارغة!');
            let txt = "طلب جديد من المتجر:\\n";
            cart.forEach(i => txt += \`- \${i.name} (\${i.qty}) = $\${i.price * i.qty}\\n\`);
            window.open(\`https://wa.me/?text=\${encodeURIComponent(txt)}\`, '_blank');
        }

        async function handleApiAdd(e) {
            e.preventDefault();
            const payload = {
                authKey: document.getElementById('api-key').value,
                name: document.getElementById('api-name').value,
                category: document.getElementById('api-cat').value,
                price: document.getElementById('api-price').value,
                image: document.getElementById('api-img').value
            };

            const res = await fetch('/api/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const json = await res.json();
            if(json.success) {
                alert('تمت الإضافة بنجاح للـ Back-End!');
                fetchProducts();
            } else {
                alert('خطأ: ' + json.message);
            }
        }

        async function deleteProductApi(id) {
            const authKey = prompt("أدخل رمز الإدارة للحذف:");
            if(!authKey) return;

            const res = await fetch('/api/products/' + id, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ authKey })
            });

            const json = await res.json();
            if(json.success) {
                alert('تم الحذف!');
                fetchProducts();
            } else {
                alert('خطأ: ' + json.message);
            }
        }

        function renderAdminList(items) {
            document.getElementById('admin-items-list').innerHTML = items.map(p => \`
                <div style="display:flex; justify-content:space-between; align-items:center; background:var(--bg-dark); padding:8px 12px; margin-bottom:6px; border-radius:6px;">
                    <span style="font-size:0.85rem;">\${p.name} ($\${p.price})</span>
                    <button onclick="deleteProductApi('\${p.id}')" style="background:var(--danger); color:#fff; border:none; padding:4px 8px; border-radius:4px; cursor:pointer;">حذف</button>
                </div>
            \`).join('');
        }

        fetchProducts();
    </script>
</body>
</html>
    `);
});

// Start Full-Stack Application
app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`🚀 DroneZone Full-Stack Server Running on Port ${PORT}`);
    console.log(`🌐 Local Web Access: http://localhost:${PORT}`);
    console.log(`====================================================`);
});

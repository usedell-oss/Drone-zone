const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'products_db.json');
const ADMIN_TOKEN = "admin123";

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

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

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`🚀 DroneZone Server Running on Port ${PORT}`);
});
        

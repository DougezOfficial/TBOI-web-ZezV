const express = require("express");
const fs = require("fs");
const path = require("path");
const app = express();
const PORT = 3000;

app.use(express.static(path.join(__dirname)));

const loadData = (file) => {
    try {
        const data = fs.readFileSync(path.join(__dirname, "static", file), "utf8");
        return JSON.parse(data);
    } catch (err) {
        console.error(`Error loading ${file}:`, err);
        return [];
    }
};

app.get("/api/data/:category", (req, res) => {
    const cat = req.params.category;
    const validFiles = {
        items: "items.json",
        bosses: "bosses.json",
        enemies: "enemies.json",
        challenges: "challenges.json"
    };
    if (!validFiles[cat]) return res.status(404).json({ error: "Category not found" });
    res.json(loadData(validFiles[cat]));
});

app.get("/api/search", (req, res) => {
    const query = req.query.q ? req.query.q.toLowerCase() : "";
    const items = loadData("items.json");
    const bosses = loadData("bosses.json");
    const enemies = loadData("enemies.json");
    const challenges = loadData("challenges.json");

    const all = [...items, ...bosses, ...enemies, ...challenges];
    const filtered = all.filter(entry => entry.name.toLowerCase().includes(query));
    res.json(filtered);
});

app.listen(PORT, () => console.log(`Basement server running on http://localhost:${PORT}`));
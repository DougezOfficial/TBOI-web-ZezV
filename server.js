const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const app = express();
const PORT = 3000;

app.use(express.static(__dirname));

// AJAX Endpoints
app.get('/api/:category', async (req, res) => {
    const category = req.params.category;
    const fileMap = {
        'items': 'items.json',
        'bosses': 'bosses.json',
        'bestiary': 'enemies.json'
    };

    try {
        if (fileMap[category]) {
            const data = await fs.readFile(path.join(__dirname, fileMap[category]), 'utf8');
            res.json(JSON.parse(data));
        } else {
            // Factual data for categories without files
            const otherData = {
                'mods': [{ name: "Fiend Folio", text: "Adds 500+ enemies." }, { name: "External Item Descriptions", text: "The essential UI mod." }],
                'secret-rooms': [{ name: "Ultra Secret Room", text: "Requires Red Key to find." }],
                'challenges': [{ name: "Backasswards", text: "Start at Mega Satan, go backwards." }]
            };
            res.json(otherData[category] || []);
        }
    } catch (err) {
        res.status(500).json({ error: "Failed to load data" });
    }
});

app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
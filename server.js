const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const app = express();
const PORT = 3000;

app.use(express.static(__dirname));

async function getFullData() {
    const files = ['items.json', 'bosses.json', 'enemies.json'];
    let combined = [];
    for (const file of files) {
        const data = JSON.parse(await fs.readFile(path.join(__dirname, file), 'utf8'));
        combined = combined.concat(data);
    }
    // Add hardcoded challenges to the search pool
    const challenges = [
        { name: "Backasswards", text: "Start at Mega Satan, go backwards.", category: "Challenge" },
        { name: "Cantripped!", text: "Everything is replaced by cards.", category: "Challenge" }
    ];
    return combined.concat(challenges);
}

// Randomizer for main sections
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// SEARCH ENDPOINT
app.get('/api/search', async (req, res) => {
    const query = req.query.q.toLowerCase();
    const allData = await getFullData();
    const results = allData.filter(item => 
        item.name.toLowerCase().includes(query) || 
        (item.text && item.text.toLowerCase().includes(query))
    );
    res.json(results.slice(0, 20)); // Return top 20 matches
});

app.get('/api/data/:category', async (req, res) => {
    const category = req.params.category;
    const fileMap = { 'items': 'items.json', 'bosses': 'bosses.json', 'bestiary': 'enemies.json' };
    const fileName = fileMap[category];

    try {
        if (fileName) {
            const data = JSON.parse(await fs.readFile(path.join(__dirname, fileName), 'utf8'));
            res.json(shuffle(data).slice(0, 10));
        } else {
            res.json([]);
        }
    } catch (err) { res.status(500).send("Error"); }
});

app.listen(PORT, () => console.log(`✅ Server: http://localhost:${PORT}`));
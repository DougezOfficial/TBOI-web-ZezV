document.addEventListener('DOMContentLoaded', () => {
    console.log("Welcome to the Basement.");

    // Section configurations
    const sections = {
        items: {
            grid: document.getElementById('items-grid'),
            search: document.getElementById('search-items'),
            api: '/api/items',
            render: renderItemCard
        },
        bosses: {
            grid: document.getElementById('bosses-grid'),
            search: document.getElementById('search-bosses'),
            api: '/api/bosses',
            render: renderSimpleCard
        },
        enemies: {
            grid: document.getElementById('enemies-grid'),
            search: document.getElementById('search-enemies'),
            api: '/api/enemies',
            render: renderSimpleCard
        }
    };

    // 1. Load Initial Content
    loadRandomItems();
    loadFeaturedContent();
    loadMiniBosses(); // Fetched from featured endpoint

    // 2. Setup Search Listeners
    setupSearch('items');
    setupSearch('bosses');
    setupSearch('enemies');

    // --- Data Loading Functions ---

    async function loadRandomItems() {
        try {
            const res = await fetch('/api/items?random=true&limit=10');
            const data = await res.json();
            renderGrid(sections.items.grid, data, renderItemCard);
        } catch (e) {
            console.error("Failed to load items", e);
        }
    }

    async function loadFeaturedContent() {
        try {
            const res = await fetch('/api/featured');
            const data = await res.json();

            // Render Featured Bosses
            const bossContainer = document.getElementById('featured-bosses');
            bossContainer.innerHTML = '';
            data.bosses.forEach(boss => {
                const card = document.createElement('div');
                card.className = 'boss-card';
                card.innerHTML = `
                    <h3>${boss.name}</h3>
                    <p>${boss.description}</p>
                    <span class="difficulty-badge">${boss.difficulty}</span>
                `;
                bossContainer.appendChild(card);
            });

            // Render Featured Enemies
            const enemyContainer = document.getElementById('featured-enemies');
            enemyContainer.innerHTML = '';
            data.enemies.forEach(enemy => {
                const card = document.createElement('div');
                card.className = 'enemy-card';
                card.innerHTML = `
                    <h3>${enemy.name}</h3>
                    <p>Rank: ${enemy.rank}</p>
                `;
                enemyContainer.appendChild(card);
            });

            // Render Mini Bosses (from featured endpoint)
            const miniBossGrid = document.getElementById('mini-bosses-grid');
            renderGrid(miniBossGrid, data.mini_bosses, (mb) => `
                <div class="mini-boss-card">
                    <h3>${mb.name}</h3>
                    <p>${mb.title}</p>
                </div>
            `);

        } catch (e) {
            console.error("Failed to load featured content", e);
        }
    }

    async function loadMiniBosses() {
        // handled in loadFeaturedContent for efficiency since it's one endpoint
    }

    // --- Search Logic ---

    function setupSearch(type) {
        const config = sections[type];
        if (!config.search) return;

        let debounceTimer;
        config.search.addEventListener('input', (e) => {
            clearTimeout(debounceTimer);
            const query = e.target.value.trim();

            debounceTimer = setTimeout(async () => {
                if (!query && type !== 'items') {
                    // Hide grid if query empty for bosses/enemies (show featured only)
                    config.grid.classList.add('hidden-grid');
                    return;
                }

                // For items, empty query might mean "load random" again or "load all"?
                // User asked: "The other items should be still searchable".
                // Let's assume empty search for items -> show random 10 again.
                if (type === 'items' && !query) {
                    loadRandomItems();
                    return;
                }

                config.grid.classList.remove('hidden-grid');
                try {
                    const res = await fetch(`${config.api}?q=${encodeURIComponent(query)}`);
                    const data = await res.json();
                    renderGrid(config.grid, data, config.render);
                } catch (e) {
                    console.error(`Search failed for ${type}`, e);
                }
            }, 300);
        });
    }

    // --- Rendering Helpers ---

    function renderGrid(container, items, renderFn) {
        container.innerHTML = '';
        if (items.length === 0) {
            container.innerHTML = '<p>Nothing found...</p>';
            return;
        }

        // Handle string render function vs DOM element
        items.forEach(item => {
            const content = renderFn(item);
            if (typeof content === 'string') {
                container.insertAdjacentHTML('beforeend', content);
            } else {
                container.appendChild(content);
            }
        });
    }

    function renderItemCard(item) {
        const card = document.createElement('div');
        card.className = `item-card ${item.rarity ? item.rarity.toLowerCase() : ''}`;

        // Placeholder icon
        const initial = item.name.charAt(0);

        card.innerHTML = `
            <div class="item-icon-placeholder">${initial}</div>
            <h3>${item.name}</h3>
            <p>${item.description}</p>
        `;
        return card;
    }

    function renderSimpleCard(item) {
        // Generic card for search results
        return `
            <div class="card">
                <h3>${item.name}</h3>
                <p>${item.type || 'Entity'}</p>
            </div>
        `;
    }

    // Intersection Observer for Animation
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.add('fade-in-section');
        observer.observe(section);
    });
});

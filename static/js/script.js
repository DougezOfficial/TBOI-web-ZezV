document.addEventListener('DOMContentLoaded', () => {
    console.log("Welcome to the Basement.");

    // MODAL ELEMENTS
    const modalOverlay = document.getElementById('modal-overlay');
    const modalClose = document.getElementById('modal-close');
    const modalBody = document.getElementById('modal-body');

    // Close modal handlers
    if (modalClose) {
        modalClose.addEventListener('click', () => {
            modalOverlay.classList.add('hidden');
        });
    }

    if (modalOverlay) {
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) {
                modalOverlay.classList.add('hidden');
            }
        });
    }

    function openModal(item) {
        if (!modalBody || !modalOverlay) return;

        // Strategy guide / How to defeat logic
        let strategy = "Hit it until it dies.";
        if (item.type === "Boss") strategy = "Learn its patterns. Dodge the projectiles.";
        if (item.name === "Mom") strategy = "Watch out for the shadow! Wait for her to stomp, then attack the foot.";
        if (item.name === "Duke of Flies") strategy = "Ignore the flies if you can, focus fire on the Duke himself.";
        if (item.difficulty === "Easy") strategy = "Just keep shooting. Minimal dodging required.";

        // For Items, explain usage
        if (item.hasOwnProperty('rarity') || item.hasOwnProperty('image_class')) {
            strategy = "Pick it up to gain its effects. " + (item.description || "No specific instructions.");
        }

        const initial = item.name.charAt(0);
        const description = item.description || item.title || "No description available.";

        modalBody.innerHTML = `
            <div class="modal-info">
                <div class="modal-img">
                     ${item.image ? `<img src="${item.image}" alt="${item.name}" style="max-width: 100%; max-height: 200px;">` : `<span style="font-size: 3rem; font-family: 'Creepster', display">${initial}</span>`}
                </div>
                <h2>${item.name}</h2>
                <p><em>${description}</em></p>
            </div>
            <div class="modal-guide">
                <h4>How to use / Defeat:</h4>
                <p>${strategy}</p>
            </div>
        `;
        modalOverlay.classList.remove('hidden');
    }

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
    loadMiniBosses();

    // 2. Setup Search Listeners
    setupSearch('items');
    setupSearch('bosses');
    setupSearch('enemies');

    // --- Data Loading Functions ---

    async function loadRandomItems() {
        if (!sections.items.grid) return;
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
            if (bossContainer) {
                bossContainer.innerHTML = '';
                data.bosses.forEach(boss => {
                    const card = document.createElement('div');
                    card.className = 'boss-card';
                    card.innerHTML = `
                        <h3>${boss.name}</h3>
                        <p>${boss.description}</p>
                        <span class="difficulty-badge">${boss.difficulty}</span>
                    `;
                    card.addEventListener('click', () => openModal(boss));
                    bossContainer.appendChild(card);
                });
            }

            // Render Featured Enemies
            const enemyContainer = document.getElementById('featured-enemies');
            if (enemyContainer) {
                enemyContainer.innerHTML = '';
                data.enemies.forEach(enemy => {
                    const card = document.createElement('div');
                    card.className = 'enemy-card';
                    card.innerHTML = `
                        <h3>${enemy.name}</h3>
                        <p>Rank: ${enemy.rank}</p>
                    `;
                    enemy.description = `Rank ${enemy.rank} Enemy`;
                    card.addEventListener('click', () => openModal(enemy));
                    enemyContainer.appendChild(card);
                });
            }

            // Render Mini Bosses
            const miniBossGrid = document.getElementById('mini-bosses-grid');
            if (miniBossGrid) {
                renderGrid(miniBossGrid, data.mini_bosses, (mb) => {
                    const div = document.createElement('div');
                    div.className = 'mini-boss-card';
                    div.innerHTML = `
                        <h3>${mb.name}</h3>
                        <p>${mb.title}</p>
                   `;
                    div.addEventListener('click', () => openModal(mb));
                    return div;
                });
            }

        } catch (e) {
            console.error("Failed to load featured content", e);
        }
    }

    async function loadMiniBosses() {
        // handled in loadFeaturedContent
    }

    // --- Search Logic ---

    function setupSearch(type) {
        const config = sections[type];
        if (!config.search || !config.grid) return;

        let debounceTimer;
        config.search.addEventListener('input', (e) => {
            clearTimeout(debounceTimer);
            const query = e.target.value.trim();

            debounceTimer = setTimeout(async () => {
                if (!query && type !== 'items') {
                    config.grid.classList.add('hidden-grid');
                    return;
                }

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

    function renderGrid(container, items, renderFn) {
        if (!container) return;
        container.innerHTML = '';
        if (items.length === 0) {
            container.innerHTML = '<p>Nothing found...</p>';
            return;
        }

        items.forEach(item => {
            const content = renderFn(item);
            if (typeof content === 'string') {
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = content.trim();
                const element = tempDiv.firstChild;
                element.addEventListener('click', () => openModal(item));
                container.appendChild(element);
            } else {
                container.appendChild(content);
            }
        });
    }

    function renderItemCard(item) {
        const card = document.createElement('div');
        card.className = `item-card ${item.rarity ? item.rarity.toLowerCase() : ''}`;

        const initial = item.name.charAt(0);

        card.innerHTML = `
            <div class="item-icon-placeholder">
                ${item.image ? `<img src="${item.image}" alt="${item.name}" loading="lazy" style="width: 100%; height: 100%; object-fit: contain;">` : initial}
            </div>
            <h3>${item.name}</h3>
            <p>${item.description}</p>
        `;
        card.addEventListener('click', () => openModal(item));
        return card;
    }

    function renderSimpleCard(item) {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <h3>${item.name}</h3>
            <p>${item.type || 'Entity'}</p>
        `;
        card.addEventListener('click', () => openModal(item));
        return card;
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

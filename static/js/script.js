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

        let strategy = "Hit it until it dies.";
        if (item.type === "Boss") strategy = "Learn its patterns. Dodge the projectiles.";
        if (item.name === "Mom") strategy = "Watch out for the shadow! Wait for her to stomp, then attack the foot.";
        if (item.name === "Duke of Flies") strategy = "Ignore the flies if you can, focus fire on the Duke himself.";
        if (item.difficulty === "Easy") strategy = "Just keep shooting. Minimal dodging required.";

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

    // STATE MANAGEMENT
    const state = {
        items: { page: 1, isLoading: false, hasMore: true, query: '' },
        bosses: { page: 1, isLoading: false, hasMore: true, query: '' },
        enemies: { page: 1, isLoading: false, hasMore: true, query: '' }
    };

    // SECTION CONFIG
    const sections = {
        items: {
            grid: document.getElementById('items-grid'),
            search: document.getElementById('search-items'),
            api: '/api/items',
            render: renderItemCard,
            limit: 24
        },
        bosses: {
            grid: document.getElementById('bosses-grid'),
            search: document.getElementById('search-bosses'),
            api: '/api/bosses',
            render: renderSimpleCard,
            limit: 24
        },
        enemies: {
            grid: document.getElementById('enemies-grid'),
            search: document.getElementById('search-enemies'),
            api: '/api/enemies',
            render: renderSimpleCard,
            limit: 24
        }
    };

    // INFINITE SCROLL OBSERVER
    const observerOptions = {
        root: null,
        rootMargin: '100px',
        threshold: 0.1
    };

    const infiniteScrollObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const sectionType = entry.target.dataset.section;
                loadMore(sectionType);
            }
        });
    }, observerOptions);

    function setupSentinel(type) {
        const grid = sections[type].grid;
        if (!grid) return;

        // Remove existing sentinel if any
        const existingSentinel = grid.parentNode.querySelector(`.sentinel[data-section="${type}"]`);
        if (existingSentinel) existingSentinel.remove();

        // Create new sentinel
        const sentinel = document.createElement('div');
        sentinel.className = 'sentinel';
        sentinel.dataset.section = type;
        sentinel.style.height = '20px';
        sentinel.style.width = '100%';
        // sentinel.innerHTML = 'Loading more...'; // Debug text

        // Append after the grid
        grid.parentNode.appendChild(sentinel);
        infiniteScrollObserver.observe(sentinel);
    }

    async function loadMore(type) {
        const s = state[type];
        const config = sections[type];

        if (s.isLoading || !s.hasMore) return;

        s.isLoading = true;

        try {
            const url = `${config.api}?page=${s.page}&limit=${config.limit}&q=${encodeURIComponent(s.query)}`;
            const res = await fetch(url);
            const data = await res.json();

            if (data.length < config.limit) {
                s.hasMore = false;
                // Cleanup sentinel logic could go here
            }

            if (data.length > 0) {
                renderGrid(config.grid, data, config.render, true); // Append true
                s.page++;
            } else if (s.page === 1) {
                config.grid.innerHTML = '<p>Nothing found...</p>';
            }

        } catch (e) {
            console.error(`Failed to load ${type}`, e);
        } finally {
            s.isLoading = false;
        }
    }

    function resetSection(type, newQuery = '') {
        state[type].page = 1;
        state[type].hasMore = true;
        state[type].isLoading = false;
        state[type].query = newQuery;

        const grid = sections[type].grid;
        if (grid) grid.innerHTML = ''; // Clear grid

        loadMore(type); // Fetch first page
    }

    // 1. Load Initial Content
    resetSection('items');
    // Bosses and Enemies are initially hidden by CSS logic (or empty search), 
    // but user wants lazy load. The original code hid them until search.
    // Let's modify: if no query for bosses/enemies, maybe don't load? 
    // Or load initial page? The original code had "Hidden Grid".
    // Let's stick to original behavior for Bosses/Enemies: Wait for search OR load initial if desired.
    // Current sections logic: they exist but are hidden-grid?
    // Let's just load them but keep them hidden if needed, OR just load featured.
    // Wait, the prompt implies "lazy loading" globally.
    // Let's just initialize them. The CSS might hide them.
    loadFeaturedContent();
    setupSentinel('items');
    setupSentinel('bosses');
    setupSentinel('enemies');

    // 2. Setup Search Listeners
    setupSearch('items');
    setupSearch('bosses');
    setupSearch('enemies');

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
                }, false);
            }

        } catch (e) {
            console.error("Failed to load featured content", e);
        }
    }

    function setupSearch(type) {
        const config = sections[type];
        if (!config.search || !config.grid) return;

        let debounceTimer;
        config.search.addEventListener('input', (e) => {
            clearTimeout(debounceTimer);
            const query = e.target.value.trim();

            debounceTimer = setTimeout(() => {
                // Remove hidden class if present when searching
                config.grid.classList.remove('hidden-grid');
                resetSection(type, query);
            }, 300);
        });
    }

    function renderGrid(container, items, renderFn, append = false) {
        if (!container) return;
        if (!append) container.innerHTML = '';

        if (!items || items.length === 0) {
            if (!append) container.innerHTML = '<p>Nothing found...</p>';
            return;
        }

        const fragment = document.createDocumentFragment();

        items.forEach(item => {
            const content = renderFn(item);
            if (typeof content === 'string') {
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = content.trim();
                const element = tempDiv.firstChild;
                element.addEventListener('click', () => openModal(item));
                fragment.appendChild(element);
            } else {
                fragment.appendChild(content);
            }
        });

        container.appendChild(fragment);
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

    // Animation Observer (Original kept for fade-ins)
    const fadeObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.add('fade-in-section');
        fadeObserver.observe(section);
    });
});

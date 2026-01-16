document.addEventListener("DOMContentLoaded", () => {
    // UI Elements
    const modal = document.getElementById("modal");
    const modalTitle = document.getElementById("modalTitle");
    const modalText = document.getElementById("modalText");
    const modalImage = document.getElementById("modalImage");
    const statHP = document.getElementById("statHP");
    const statChapter = document.getElementById("statChapter");
    const closeBtn = document.querySelector(".close");
    const globalSearch = document.getElementById("globalSearch");
    const globalResults = document.getElementById("globalResults");

    /**
     * 1. CORE FUNCTION: Show Details
     * Handles objects safely to prevent site crashes
     */
    window.showItem = (item) => {
        if (!item) return;

        modalTitle.innerText = item.name || "Unknown";
        modalText.innerText = item.text || `Type: ${item.type || 'Entity'}`;
        
        // Image logic
        const imgSrc = item.image || 'https://bindingofisaacrebirth.glitch.me/static/collectibles/question_mark.png';
        modalImage.src = imgSrc;

        // Dynamic Stats (HP & Chapter)
        // If the element exists in HTML and value exists in JSON, show it
        if (statHP) statHP.innerText = item.hp ? item.hp : "";
        if (statChapter) statChapter.innerText = item.chapter ? item.chapter : "";

        modal.style.display = "flex"; 
        if (globalResults) globalResults.style.display = "none";
    };

    /**
     * 2. CARD GENERATION
     */
    function createCard(item) {
        const card = document.createElement('div');
        card.className = 'card';
        
        const imgSrc = item.image || 'https://bindingofisaacrebirth.glitch.me/static/collectibles/question_mark.png';
        
        // Build subtext: Show HP if it exists, otherwise generic text
        const subText = item.hp ? `HP: ${item.hp}` : 'VIEW DETAILS';

        card.innerHTML = `
            <img src="${imgSrc}" class="item-icon" onerror="this.src='https://bindingofisaacrebirth.glitch.me/static/collectibles/question_mark.png'">
            <h3>${item.name || 'Unknown'}</h3>
            <p style="font-family: 'Indie Flower', cursive; font-size: 0.85rem; font-weight: bold; color: #a31d1d;">${subText}</p>
        `;
        
        card.onclick = () => showItem(item);
        return card;
    }

    /**
     * 3. DATA FETCHING & GRID RENDERING
     */
    async function loadSectionData(category, gridElement) {
        try {
            const response = await fetch(`/api/data/${category}`);
            const data = await response.json();
            
            // Store full data for local search
            gridElement.dataset.fullData = JSON.stringify(data);
            
            renderGrid(gridElement, data.slice(0, 10)); // Default 10 random
        } catch (e) {
            console.error("Failed to load section:", category, e);
            gridElement.innerHTML = '<p>The basement is empty...</p>';
        }
    }

    function renderGrid(container, items) {
        container.innerHTML = '';
        if (!items || items.length === 0) {
            container.innerHTML = '<p>No matching entities found.</p>';
            return;
        }
        items.slice(0, 10).forEach(item => container.appendChild(createCard(item)));
    }

    /**
     * 4. GLOBAL SEARCH (All Categories)
     */
    if (globalSearch) {
        globalSearch.addEventListener("input", async (e) => {
            const query = e.target.value.trim();
            if (query.length < 2) { 
                globalResults.style.display = "none"; 
                return; 
            }

            try {
                const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
                const results = await response.json();

                if (results.length > 0) {
                    globalResults.innerHTML = results.map((item, index) => `
                        <div class="search-item" data-idx="${index}">
                            <strong>${item.name}</strong> 
                            <span style="font-size:0.7rem; color:gray;">(${item.type || 'Result'})</span>
                        </div>
                    `).join('');

                    // Attach click events to the results
                    globalResults.querySelectorAll('.search-item').forEach(div => {
                        div.onclick = () => showItem(results[div.dataset.idx]);
                    });

                    globalResults.style.display = "block";
                } else {
                    globalResults.innerHTML = '<div class="search-item">Nothing found...</div>';
                    globalResults.style.display = "block";
                }
            } catch (err) { 
                console.error("Search error:", err); 
            }
        });
    }

    /**
     * 5. LOCAL SEARCH (Filters)
     */
    document.addEventListener('input', (e) => {
        if (e.target.classList.contains('local-search')) {
            const category = e.target.dataset.filter;
            const grid = document.querySelector(`#${category} .grid`);
            if (!grid || !grid.dataset.fullData) return;

            const allData = JSON.parse(grid.dataset.fullData);
            const searchTerm = e.target.value.toLowerCase();
            
            const filtered = allData.filter(i => 
                i.name.toLowerCase().includes(searchTerm)
            );
            renderGrid(grid, filtered);
        }
    });

    /**
     * 6. LAZY LOADING
     */
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const section = entry.target;
                const api = section.getAttribute('data-api');
                const grid = section.querySelector('.grid');
                if (api && grid) {
                    loadSectionData(api, grid);
                    observer.unobserve(section);
                }
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('section.lazy').forEach(sec => observer.observe(sec));

    /**
     * 7. MODAL CLOSING
     */
    if (closeBtn) closeBtn.onclick = () => modal.style.display = "none";
    window.onclick = (e) => {
        if (e.target == modal) modal.style.display = "none";
        if (globalSearch && !globalSearch.contains(e.target)) globalResults.style.display = "none";
    };
});
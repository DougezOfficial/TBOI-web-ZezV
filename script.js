document.addEventListener("DOMContentLoaded", () => {

    const modal = document.getElementById("modal");
    const modalTitle = document.getElementById("modalTitle");
    const modalText = document.getElementById("modalText");
    const closeBtn = document.querySelector(".close");
    const globalSearch = document.getElementById("globalSearch");
    const globalResults = document.getElementById("globalResults");

    window.showItem = (name, text) => {
        modalTitle.innerText = name;
        modalText.innerText = text || "No additional data available.";
        modal.style.display = "block";
        globalResults.style.display = "none";
    };

    function createCard(item) {
        const card = document.createElement('div');
        card.className = 'card';
        
        const imgSrc = item.image ? item.image : 'https://bindingofisaacrebirth.glitch.me/static/collectibles/question_mark.png';
        const imgHtml = `<img src="${imgSrc}" class="item-icon" onerror="this.src='https://bindingofisaacrebirth.glitch.me/static/collectibles/question_mark.png'">`;

        card.innerHTML = `
            ${imgHtml}
            <h3>${item.name}</h3>
            <p style="font-family: 'Indie Flower', cursive; font-size: 0.9rem;">CLICK TO INSPECT</p>
        `;
        
        card.onclick = () => showItem(item.name, item.text || `Type: ${item.type}`);
        return card;
    }

    async function loadSectionData(category, gridElement) {
        try {
            const response = await fetch(`/api/data/${category}`);
            if (!response.ok) throw new Error("Server error");
            
            const data = await response.json();
            
            gridElement.dataset.fullData = JSON.stringify(data);
            
            renderGrid(gridElement, data.slice(0, 10));
        } catch (e) {
            console.error(e);
            gridElement.innerHTML = '<p style="color:red; font-family: sans-serif;">Error connecting to server. Make sure node server.js is running.</p>';
        }
    }

    function renderGrid(container, items) {
        container.innerHTML = '';
        if (items.length === 0) {
            container.innerHTML = '<p>No matching results found.</p>';
            return;
        }
        items.slice(0, 10).forEach(item => {
            container.appendChild(createCard(item));
        });
    }

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
                globalResults.innerHTML = results.map(item => `
                    <div class="search-item" onclick="showItem('${item.name.replace(/'/g, "\\'")}', '${(item.text || item.type || "").replace(/'/g, "\\'")}')">
                        <strong>${item.name}</strong> 
                        <span style="font-size:0.7rem; color:gray; font-family: sans-serif;">(${item.type || 'Result'})</span>
                    </div>
                `).join('');
                globalResults.style.display = "block";
            } else {
                globalResults.innerHTML = '<div class="search-item">No results found in basement...</div>';
                globalResults.style.display = "block";
            }
        } catch (err) {
            console.error("Global search failed", err);
        }
    });

    document.addEventListener('input', (e) => {
        if (e.target.classList.contains('local-search')) {
            const category = e.target.dataset.filter;
            const grid = document.querySelector(`#${category} .grid`);
            const searchTerm = e.target.value.toLowerCase();
            
            const allData = JSON.parse(grid.dataset.fullData || "[]");

            const filtered = allData.filter(item => 
                item.name.toLowerCase().includes(searchTerm)
            );

            renderGrid(grid, filtered);
        }
    });

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const section = entry.target;
                const category = section.getAttribute('data-api');
                const grid = section.querySelector('.grid');
                
                if (category && grid) {
                    loadSectionData(category, grid);
                    observer.unobserve(section);
                }
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('section.lazy').forEach(sec => observer.observe(sec));

    if (closeBtn) {
        closeBtn.onclick = () => modal.style.display = "none";
    }

    window.onclick = (e) => {
        if (e.target == modal) modal.style.display = "none";
        if (!globalSearch.contains(e.target) && !globalResults.contains(e.target)) {
            globalResults.style.display = "none";
        }
    };
});
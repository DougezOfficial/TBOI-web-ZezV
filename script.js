document.addEventListener("DOMContentLoaded", () => {
    const modal = document.getElementById("modal");
    const modalTitle = document.getElementById("modalTitle");
    const modalText = document.getElementById("modalText");
    const modalImage = document.getElementById("modalImage");
    const statHP = document.getElementById("statHP");
    const statChapter = document.getElementById("statChapter");
    const closeBtn = document.querySelector(".close");
    const globalSearch = document.getElementById("globalSearch");
    const globalResults = document.getElementById("globalResults");

    /*zamíchávání karet na každém reloadu */
    const shuffleArray = (array) => {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    };

    /*vnitřek karty*/
    /*když není obrázek, hoď otazník.png*/
    window.showItem = (item) => {
        if (!item) return;
        modalTitle.innerText = item.name || "Unknown";
        modalText.innerText = item.text || `Type: ${item.type || 'Entity'}`;
        modalImage.src = item.image || '/static/collectibles/question_mark.png';
        
        if (statHP) statHP.innerText = item.hp ? item.hp : (item.goal ? `Goal: ${item.goal}` : "");
        if (statChapter) statChapter.innerText = item.chapter ? item.chapter : "";

        modal.style.display = "flex"; 
        if (globalResults) globalResults.style.display = "none";
    };

    function createCard(item) {
        const card = document.createElement('div');
        card.className = 'card';
        const imgSrc = item.image || '/static/collectibles/question_mark.png';
        let subText = item.hp ? `HP: ${item.hp}` : (item.goal ? `GOAL: ${item.goal}` : 'VIEW');

        card.innerHTML = `
            <img src="${imgSrc}" class="item-icon" onerror="this.src='/static/collectibles/question_mark.png'">
            <h3>${item.name || 'Unknown'}</h3>
            <p style="font-family: 'Indie Flower', cursive; font-size: 0.85rem; font-weight: bold; color: #a31d1d;">${subText}</p>
        `;
        card.onclick = () => showItem(item);
        return card;
    }

    /* kontrola kategorie, když kategorie challenges, nezamíchávej karty na reloadu, jinak ano*/ 
    async function loadSectionData(category, gridElement) {
        try {
            const response = await fetch(`/api/data/${category}`);
            const data = await response.json();
            gridElement.dataset.fullData = JSON.stringify(data);
            
            if (category === 'challenges') {
                renderGrid(gridElement, data, false);
            } else {
                const shuffled = shuffleArray([...data]);
                renderGrid(gridElement, shuffled, true);
            }
        } catch (e) {
            gridElement.innerHTML = '<p>The basement is empty...</p>';
        }
    }

    function renderGrid(container, items, isLimited) {
        container.innerHTML = '';
        if (!items || items.length === 0) {
            container.innerHTML = '<p>No matching entities found.</p>';
            return;
        }
        const itemsToDisplay = isLimited ? items.slice(0, 10) : items;
        itemsToDisplay.forEach(item => container.appendChild(createCard(item)));
    }

    /*funkce hledání celostránkově */
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
                    globalResults.querySelectorAll('.search-item').forEach(div => {
                        div.onclick = () => showItem(results[div.dataset.idx]);
                    });
                    globalResults.style.display = "block";
                } else {
                    globalResults.innerHTML = '<div class="search-item">Nothing found...</div>';
                    globalResults.style.display = "block";
                }
            } catch (err) { console.error(err); }
        });
    }

    /*funkce hledání v jednotlivých kartách */
    document.addEventListener('input', (e) => {
        if (e.target.classList.contains('local-search')) {
            const category = e.target.dataset.filter;
            const grid = document.querySelector(`#${category === 'enemies' ? 'bestiary' : category} .grid`);
            if (!grid || !grid.dataset.fullData) return;
            const allData = JSON.parse(grid.dataset.fullData);
            const filtered = allData.filter(i => i.name.toLowerCase().includes(e.target.value.toLowerCase()));
            renderGrid(grid, filtered, category !== 'challenges');
        }
    });

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                loadSectionData(entry.target.getAttribute('data-api'), entry.target.querySelector('.grid'));
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('section.lazy').forEach(sec => observer.observe(sec));
    if (closeBtn) closeBtn.onclick = () => modal.style.display = "none";
    window.onclick = (e) => { if (e.target == modal) modal.style.display = "none"; };
});
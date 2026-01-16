document.addEventListener("DOMContentLoaded", () => {
    const modal = document.getElementById("modal");
    const modalTitle = document.getElementById("modalTitle");
    const modalText = document.getElementById("modalText");
    const modalImage = document.getElementById("modalImage");
    const closeBtn = document.querySelector(".close");
    const globalSearch = document.getElementById("globalSearch");
    const globalResults = document.getElementById("globalResults");

    window.showItem = (name, text, imgSrc) => {
        modalTitle.innerText = name;
        modalText.innerText = text || "No additional data available.";
        
        const finalImg = imgSrc || 'https://bindingofisaacrebirth.glitch.me/static/collectibles/question_mark.png';
        modalImage.src = finalImg;
        
        modal.style.display = "flex"; 
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
        
        card.onclick = () => showItem(item.name, item.text || `Type: ${item.type}`, imgSrc);
        return card;
    }

    async function loadSectionData(category, gridElement) {
        try {
            const response = await fetch(`/api/data/${category}`);
            const data = await response.json();
            gridElement.dataset.fullData = JSON.stringify(data);
            renderGrid(gridElement, data.slice(0, 10));
        } catch (e) {
            gridElement.innerHTML = '<p>Error connecting to basement...</p>';
        }
    }

    function renderGrid(container, items) {
        container.innerHTML = '';
        items.slice(0, 10).forEach(item => container.appendChild(createCard(item)));
    }

    globalSearch.addEventListener("input", async (e) => {
        const query = e.target.value.trim();
        if (query.length < 2) { globalResults.style.display = "none"; return; }

        try {
            const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
            const results = await response.json();

            globalResults.innerHTML = results.map(item => {
                const imgPath = item.image || '';
                const desc = (item.text || item.type || "").replace(/'/g, "\\'");
                const name = item.name.replace(/'/g, "\\'");
                return `
                    <div class="search-item" onclick="showItem('${name}', '${desc}', '${imgPath}')">
                        <strong>${item.name}</strong> 
                        <span style="font-size:0.7rem; color:gray;">(${item.type || 'Result'})</span>
                    </div>
                `;
            }).join('');
            globalResults.style.display = "block";
        } catch (err) { console.error(err); }
    });

    document.addEventListener('input', (e) => {
        if (e.target.classList.contains('local-search')) {
            const category = e.target.dataset.filter;
            const grid = document.querySelector(`#${category} .grid`);
            const allData = JSON.parse(grid.dataset.fullData || "[]");
            const filtered = allData.filter(i => i.name.toLowerCase().includes(e.target.value.toLowerCase()));
            renderGrid(grid, filtered);
        }
    });

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const section = entry.target;
                loadSectionData(section.getAttribute('data-api'), section.querySelector('.grid'));
                observer.unobserve(section);
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('section.lazy').forEach(sec => observer.observe(sec));

    closeBtn.onclick = () => modal.style.display = "none";
    window.onclick = (e) => {
        if (e.target == modal) modal.style.display = "none";
        if (!globalSearch.contains(e.target)) globalResults.style.display = "none";
    };
});
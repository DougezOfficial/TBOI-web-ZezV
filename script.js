document.addEventListener("DOMContentLoaded", () => {
    const modal = document.getElementById("modal");
    const modalTitle = document.getElementById("modalTitle");
    const modalText = document.getElementById("modalText");
    const closeBtn = document.querySelector(".close");

    // AJAX function to fetch content
    async function loadSectionData(category, gridElement) {
        try {
            const response = await fetch(`/api/${category}`);
            const data = await response.json();
            
            gridElement.innerHTML = ''; // Clear loading state
            
            data.slice(0, 20).forEach(item => { // Slice to limit initial load
                const card = document.createElement('div');
                card.className = 'card';
                card.innerHTML = `<h3>${item.name}</h3><p>View Stats</p>`;
                
                // Interaction: Modal
                card.onclick = () => {
                    modalTitle.innerText = item.name;
                    modalText.innerText = item.text || item.type || "No additional data available.";
                    modal.style.display = "block";
                };
                gridElement.appendChild(card);
            });
        } catch (e) {
            gridElement.innerHTML = '<p>Error loading data.</p>';
        }
    }

    // Lazy Loading Observer
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const section = entry.target;
                const category = section.getAttribute('data-api');
                const grid = section.querySelector('.grid');
                
                grid.innerHTML = '<em>Loading items...</em>';
                loadSectionData(category, grid);
                observer.unobserve(section);
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.lazy').forEach(sec => observer.observe(sec));

    closeBtn.onclick = () => modal.style.display = "none";
    window.onclick = (e) => { if (e.target == modal) modal.style.display = "none"; };
});
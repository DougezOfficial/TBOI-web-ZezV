document.addEventListener('DOMContentLoaded', () => {
    console.log("Welcome to the Basement.");

    // Smooth scrolling
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // Intersection Observer
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

    // Item Search & Rendering
    const searchInput = document.getElementById('item-search');
    const itemsGrid = document.getElementById('items-grid');
    let debounceTimer;

    function renderItems(items) {
        itemsGrid.innerHTML = '';
        if (items.length === 0) {
            itemsGrid.innerHTML = '<p>No items found in the basement...</p>';
            return;
        }

        items.forEach(item => {
            const card = document.createElement('div');
            card.className = `item-card ${item.rarity.toLowerCase()}`;

            // Create placeholders for now, can be replaced with real images
            const imgPlaceholder = document.createElement('div');
            imgPlaceholder.className = 'item-icon-placeholder item-img';
            imgPlaceholder.textContent = item.name[0]; // First letter as icon

            const title = document.createElement('h3');
            title.textContent = item.name;

            const desc = document.createElement('p');
            desc.textContent = item.description;

            card.appendChild(imgPlaceholder);
            card.appendChild(title);
            card.appendChild(desc);
            itemsGrid.appendChild(card);
        });
    }

    async function fetchItems(query = '') {
        try {
            const response = await fetch(`/api/items?q=${encodeURIComponent(query)}`);
            const data = await response.json();
            renderItems(data);
        } catch (error) {
            console.error('Error fetching items:', error);
            itemsGrid.innerHTML = '<p>Error contacting the devil deal (API failed).</p>';
        }
    }

    // Initial fetch
    fetchItems();

    // Search event
    searchInput.addEventListener('input', (e) => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            fetchItems(e.target.value);
        }, 300); // 300ms debounce
    });
});

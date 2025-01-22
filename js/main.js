document.addEventListener('DOMContentLoaded', () => {
  // Initialize each component only if their required elements exist
  if (document.querySelector('.filter-input')) {
    initializeFilters();
  }
  
  if (document.getElementById('featured-events')) {
    loadFeaturedEvents();
  }
  
  if (document.getElementById('category-events')) {
    loadCategoryEvents();
  }
  
  if (document.getElementById('search')) {
    initializeSearch();
  }
  
  if (document.querySelector('.category-tabs')) {
    initializeTabs();
  }
});

// Load featured events
async function loadFeaturedEvents() {
  try {
    const events = await fetchFeaturedEvents();
    const container = document.getElementById('featured-events');
    renderEvents(events, container);
  } catch (error) {
    console.error('Error loading featured events:', error);
  }
}

// Load category events
async function loadCategoryEvents(category = 'all') {
  try {
    const events = await fetchCategoryEvents(category);
    const container = document.getElementById('category-events');
    renderEvents(events, container);
  } catch (error) {
    console.error('Error loading category events:', error);
  }
}

// Enhanced filtering system
function initializeFilters() {
  const filterForm = document.getElementById('filter-form');
  const filterInputs = document.querySelectorAll('.filter-input');
  
  filterInputs.forEach(input => {
    input.addEventListener('change', () => applyFilters());
  });

  // Date range filters
  const dateFrom = document.getElementById('dateFrom');
  const dateTo = document.getElementById('dateTo');
  
  if (dateFrom && dateTo) {
    dateFrom.addEventListener('change', () => {
      dateTo.min = dateFrom.value;
      applyFilters();
    });
    
    dateTo.addEventListener('change', () => {
      dateFrom.max = dateTo.value;
      applyFilters();
    });
  }
}

async function applyFilters() {
  const filters = {
    city: document.getElementById('city')?.value || '',
    type: document.getElementById('type')?.value || '',
    price: document.getElementById('price')?.value || '',
    dateFrom: document.getElementById('dateFrom')?.value || '',
    dateTo: document.getElementById('dateTo')?.value || '',
    status: document.getElementById('status')?.value || ''
  };

  try {
    const container = document.getElementById('category-events');
    if (!container) return; // Skip if container doesn't exist

    const results = await filterEvents(filters);
    renderEvents(results, container);
    updateFilterCounts(results);
  } catch (error) {
    console.error('Error applying filters:', error);
  }
}

// Render events with enhanced details
function renderEvents(events, container) {
  container.innerHTML = events.map(event => `
    <div class="event-card" data-event-id="${event.id}">
      <img src="${event.image}" alt="${event.title}" class="event-image">
      <div class="event-content">
        <div class="event-header">
          <h3 class="event-title">${event.title}</h3>
          ${event.isFree ? '<span class="tag free-tag">Ücretsiz</span>' : 
            `<span class="tag price-tag">${event.price} TL</span>`}
        </div>
        
        <p class="event-description">${event.description}</p>
        
        <div class="event-meta">
          <div class="meta-item">
            <i class="icon-calendar"></i>
            <span>${formatDate(event.startDate)} - ${formatDate(event.endDate)}</span>
          </div>
          <div class="meta-item">
            <i class="icon-location"></i>
            <span>${event.city}</span>
          </div>
          <div class="meta-item">
            <i class="icon-users"></i>
            <span>${event.capacity} Kişilik</span>
          </div>
        </div>

        <div class="event-footer">
          <span class="deadline">Son Başvuru: ${formatDate(event.deadline)}</span>
          <a href="/etkinlik/${event.id}" class="btn btn-details">Detayları Gör</a>
        </div>
      </div>
    </div>
  `).join('');

  // Update click handlers to use modal
  const cards = container.querySelectorAll('.event-card');
  cards.forEach(card => {
    card.addEventListener('click', () => {
      const eventId = card.dataset.eventId;
      eventModal.show(eventId);
    });
  });
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}

function updateFilterCounts(results) {
  const totalCount = document.getElementById('total-count');
  const freeCount = document.getElementById('free-count');
  const upcomingCount = document.getElementById('upcoming-count');

  if (totalCount) totalCount.textContent = results.length;
  if (freeCount) freeCount.textContent = results.filter(e => e.isFree).length;
  if (upcomingCount) {
    upcomingCount.textContent = results.filter(e => new Date(e.startDate) > new Date()).length;
  }
}

// Initialize search functionality
function initializeSearch() {
  const searchInput = document.getElementById('search');
  if (!searchInput) return; // Skip if element doesn't exist
  
  searchInput.addEventListener('input', debounce(async (e) => {
    const searchTerm = e.target.value;
    if (searchTerm.length >= 3) {
      try {
        const results = await searchEvents(searchTerm);
        const container = document.getElementById('category-events');
        if (container) { // Only render if container exists
          renderEvents(results, container);
        }
      } catch (error) {
        console.error('Error searching events:', error);
      }
    }
  }, 300));
}

// Initialize category tabs
function initializeTabs() {
  const tabs = document.querySelectorAll('.tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', async () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const category = tab.dataset.category;
      await loadCategoryEvents(category);
    });
  });
}

// Debounce helper function
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}
class EventModal {
  constructor() {
    this.modal = null;
    this.overlay = null;
    this.currentEventId = null;
    this.cache = new Map();
    this.init();
  }

  init() {
    // Create modal HTML
    const modalHTML = `
      <div class="modal-overlay">
        <div class="event-modal">
          <div class="modal-header">
            <h2 class="event-title">Loading...</h2>
            <button class="modal-close">&times;</button>
          </div>
          <div class="modal-content">
            <div class="loading-container">
              <div class="loading-spinner"></div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-outline" id="share-btn">Paylaş</button>
            <a href="#" class="btn btn-primary" id="apply-btn">Başvuru Yap</a>
          </div>
        </div>
      </div>
    `;

    // Insert modal into DOM
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Cache elements
    this.modal = document.querySelector('.event-modal');
    this.overlay = document.querySelector('.modal-overlay');
    this.closeBtn = this.modal.querySelector('.modal-close');
    this.shareBtn = this.modal.querySelector('#share-btn');

    // Bind events
    this.closeBtn.addEventListener('click', () => this.close());
    this.overlay.addEventListener('click', (e) => {
      if (e.target === this.overlay) this.close();
    });
    this.shareBtn.addEventListener('click', (e) => this.handleShare(e));

    // Keyboard events
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen()) this.close();
    });
  }

  async show(eventId) {
    this.currentEventId = eventId;
    this.showLoading();
    this.modal.classList.add('active');
    this.overlay.classList.add('active');
    document.body.style.overflow = 'hidden';

    try {
      const eventData = await this.getEventData(eventId);
      this.renderEventDetails(eventData);
    } catch (error) {
      this.showError();
    }
  }

  close() {
    this.modal.classList.remove('active');
    this.overlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  isOpen() {
    return this.modal.classList.contains('active');
  }

  showLoading() {
    this.modal.querySelector('.modal-content').innerHTML = `
      <div class="loading-container">
        <div class="loading-spinner"></div>
      </div>
    `;
  }

  showError() {
    this.modal.querySelector('.modal-content').innerHTML = `
      <div class="error-message">
        <p>Etkinlik bilgileri yüklenemedi. Lütfen daha sonra tekrar deneyin.</p>
        <button class="btn btn-outline" onclick="eventModal.close()">Kapat</button>
      </div>
    `;
  }

  async getEventData(eventId) {
    // Check cache first
    if (this.cache.has(eventId)) {
      return this.cache.get(eventId);
    }

    try {
      const response = await fetch(`${API_BASE_URL}/events/${eventId}`);
      const data = await response.json();
      // Cache the result
      this.cache.set(eventId, data);
      return data;
    } catch (error) {
      console.error('Error fetching event details:', error);
      return getMockEventDetails(); // For development
    }
  }

  renderEventDetails(event) {
    // Update header
    this.modal.querySelector('.event-title').textContent = event.title;

    // Update content
    this.modal.querySelector('.modal-content').innerHTML = `
      <div class="event-content">
        <div class="event-main">
          <div class="event-image">
            <img src="${event.image}" alt="${event.title}" loading="lazy">
          </div>

          <section class="event-section">
            <h3>Etkinlik Hakkında</h3>
            <p>${event.description}</p>
          </section>

          <section class="event-section">
            <h3>Program Akışı</h3>
            <div class="event-schedule">
              ${event.schedule?.map(item => `
                <div class="schedule-item">
                  <span class="schedule-time">${item.time}</span>
                  <span class="schedule-activity">${item.activity}</span>
                </div>
              `).join('') || 'Program akışı henüz eklenmedi.'}
            </div>
          </section>
        </div>

        <div class="event-sidebar">
          <div class="info-card">
            <h3>Etkinlik Bilgileri</h3>
            <div class="info-list">
              <div class="info-item">
                <i class="icon-calendar"></i>
                <div>
                  <label>Tarih</label>
                  <span>${this.formatDateRange(event.startDate, event.endDate)}</span>
                </div>
              </div>
              <div class="info-item">
                <i class="icon-location"></i>
                <div>
                  <label>Konum</label>
                  <span>${event.city}</span>
                </div>
              </div>
              <div class="info-item">
                <i class="icon-users"></i>
                <div>
                  <label>Kontenjan</label>
                  <span>${event.capacity} Kişi</span>
                </div>
              </div>
            </div>
          </div>

          <div class="info-card">
            <h3>Organizatör</h3>
            <div class="organizer-info">
              <div class="organizer-details">
                <h4>${event.organizer.name}</h4>
                <p>${event.organizer.description || ''}</p>
                <div class="social-links">
                  ${event.organizer.instagram ? 
                    `<a href="https://instagram.com/${event.organizer.instagram}" target="_blank">Instagram</a>` : ''}
                  ${event.organizer.twitter ? 
                    `<a href="https://twitter.com/${event.organizer.twitter}" target="_blank">Twitter</a>` : ''}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    // Update footer buttons
    const applyBtn = this.modal.querySelector('#apply-btn');
    applyBtn.href = event.applicationForm;
    
    if (new Date() > new Date(event.deadline)) {
      applyBtn.classList.add('disabled');
      applyBtn.textContent = 'Başvuru Kapandı';
      applyBtn.removeAttribute('href');
    }
  }

  formatDateRange(start, end) {
    const startDate = new Date(start);
    const endDate = new Date(end);
    
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    
    if (startDate.toDateString() === endDate.toDateString()) {
      return startDate.toLocaleDateString('tr-TR', options);
    }
    
    return `${startDate.toLocaleDateString('tr-TR', options)} - ${endDate.toLocaleDateString('tr-TR', options)}`;
  }

  async handleShare(e) {
    const shareData = {
      title: document.querySelector('.event-title').textContent,
      url: `${window.location.origin}/etkinlik/${this.currentEventId}`,
    };

    const shareMenu = document.createElement('div');
    shareMenu.className = 'share-menu';
    shareMenu.style.top = `${e.clientY}px`;
    shareMenu.style.left = `${e.clientX}px`;
    
    shareMenu.innerHTML = `
      <button data-share="copy">
        <i class="icon-copy"></i>
        Linki Kopyala
      </button>
      <button data-share="whatsapp">
        <i class="icon-whatsapp"></i>
        WhatsApp'ta Paylaş
      </button>
      <button data-share="twitter">
        <i class="icon-twitter"></i>
        Twitter'da Paylaş
      </button>
    `;

    document.body.appendChild(shareMenu);
    shareMenu.classList.add('active');

    const handleShareClick = async (e) => {
      const shareType = e.target.closest('button')?.dataset.share;
      if (!shareType) return;

      switch (shareType) {
        case 'copy':
          await navigator.clipboard.writeText(shareData.url);
          alert('Link kopyalandı!');
          break;
        case 'whatsapp':
          window.open(`https://wa.me/?text=${encodeURIComponent(shareData.title + '\n' + shareData.url)}`);
          break;
        case 'twitter':
          window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareData.title)}&url=${encodeURIComponent(shareData.url)}`);
          break;
      }
      shareMenu.remove();
    };

    shareMenu.addEventListener('click', handleShareClick);
    document.addEventListener('click', (e) => {
      if (!shareMenu.contains(e.target) && e.target !== this.shareBtn) {
        shareMenu.remove();
      }
    }, { once: true });
  }
}

// Initialize modal
const eventModal = new EventModal();

// Update event card click handlers
document.querySelectorAll('.event-card').forEach(card => {
  card.addEventListener('click', () => {
    const eventId = card.dataset.eventId;
    eventModal.show(eventId);
  });
});
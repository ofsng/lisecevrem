document.addEventListener('DOMContentLoaded', () => {
  loadEventDetails();
});

async function loadEventDetails() {
  // Get event ID from URL
  const eventId = window.location.pathname.split('/').pop();
  
  try {
    const event = await fetchEventDetails(eventId);
    renderEventDetails(event);
  } catch (error) {
    console.error('Error loading event details:', error);
    showError('Etkinlik detayları yüklenirken bir hata oluştu.');
  }
}

async function fetchEventDetails(eventId) {
  try {
    const response = await fetch(`${API_BASE_URL}/events/${eventId}`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching event details:', error);
    // For development, return mock data
    return getMockEventDetails();
  }
}

function renderEventDetails(event) {
  // Update page title
  document.title = `${event.title} - lise.cevrem.net`;
  
  // Basic event info
  document.getElementById('event-title').textContent = event.title;
  document.getElementById('event-type').textContent = event.type;
  document.getElementById('event-status').textContent = getEventStatus(event);
  document.getElementById('event-price').textContent = formatPrice(event.price);
  document.getElementById('event-description').textContent = event.description;
  
  // Event poster
  const posterImg = document.getElementById('event-poster');
  posterImg.src = event.image;
  posterImg.alt = `${event.title} Posteri`;

  // Update application button
  const applyBtn = document.getElementById('apply-btn');
  applyBtn.href = event.applicationForm;
  updateApplyButtonState(event);

  // Event schedule
  if (event.schedule && event.schedule.length > 0) {
    const scheduleContainer = document.getElementById('event-schedule');
    scheduleContainer.innerHTML = event.schedule.map(item => `
      <div class="schedule-item">
        <span class="schedule-time">${item.time}</span>
        <span class="schedule-activity">${item.activity}</span>
      </div>
    `).join('');
  }

  // Event requirements
  if (event.requirements && event.requirements.length > 0) {
    const requirementsList = document.getElementById('event-requirements');
    requirementsList.innerHTML = event.requirements.map(req => `
      <li>${req}</li>
    `).join('');
  }

  // Event info card
  document.getElementById('event-date').textContent = formatDateRange(event.startDate, event.endDate);
  document.getElementById('event-time').textContent = formatTimeRange(event.startTime, event.endTime);
  document.getElementById('event-location').textContent = event.city;
  document.getElementById('event-capacity').textContent = `${event.capacity} Kişi`;
  document.getElementById('event-deadline').textContent = formatDate(event.deadline);

  // Organizer info
  document.getElementById('organizer-name').textContent = event.organizer.name;
  document.getElementById('organizer-description').textContent = event.organizer.description || '';
  document.getElementById('organizer-avatar').src = event.organizer.avatar || 'default-avatar.png';
  
  // Social links
  const instagramLink = document.getElementById('instagram-link');
  const twitterLink = document.getElementById('twitter-link');
  
  if (event.organizer.instagram) {
    instagramLink.href = `https://instagram.com/${event.organizer.instagram}`;
  } else {
    instagramLink.style.display = 'none';
  }
  
  if (event.organizer.twitter) {
    twitterLink.href = `https://twitter.com/${event.organizer.twitter}`;
  } else {
    twitterLink.style.display = 'none';
  }

  // Contact info
  document.getElementById('contact-email').textContent = event.organizer.email;
  document.getElementById('contact-phone').textContent = event.organizer.phone;

  // Initialize share button
  initializeShare(event);
}

function formatPrice(price) {
  if (!price || price === 0) return 'Ücretsiz';
  return `${price} TL`;
}

function formatDateRange(start, end) {
  const startDate = new Date(start);
  const endDate = new Date(end);
  
  if (isSameDay(startDate, endDate)) {
    return formatDate(startDate);
  }
  
  return `${formatDate(startDate)} - ${formatDate(endDate)}`;
}

function formatTimeRange(start, end) {
  return `${start} - ${end}`;
}

function formatDate(date) {
  return new Date(date).toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}

function isSameDay(d1, d2) {
  return d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();
}

function getEventStatus(event) {
  const now = new Date();
  const deadline = new Date(event.deadline);
  const startDate = new Date(event.startDate);
  
  if (now > deadline) return 'Başvuru Kapandı';
  if (now > startDate) return 'Etkinlik Başladı';
  return 'Başvuru Açık';
}

function updateApplyButtonState(event) {
  const applyBtn = document.getElementById('apply-btn');
  const now = new Date();
  const deadline = new Date(event.deadline);
  
  if (now > deadline) {
    applyBtn.classList.add('disabled');
    applyBtn.textContent = 'Başvuru Kapandı';
    applyBtn.removeAttribute('href');
  }
}

function initializeShare(event) {
  const shareBtn = document.getElementById('share-btn');
  
  shareBtn.addEventListener('click', async () => {
    const shareData = {
      title: event.title,
      text: event.description,
      url: window.location.href
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback copy to clipboard
        await navigator.clipboard.writeText(window.location.href);
        alert('Etkinlik linki kopyalandı!');
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  });
}

function getMockEventDetails() {
  return {
    id: 1,
    title: "İstanbul MUN 2024",
    type: "MUN",
    description: "Türkiye'nin en büyük Model Birleşmiş Milletler konferansı, bu yıl 10. kez düzenleniyor. Delegeler, gerçek dünya sorunlarını tartışacak ve çözüm önerileri geliştirecek.",
    image: "https://placehold.co/800x400",
    startDate: "2024-03-15",
    endDate: "2024-03-17",
    startTime: "09:00",
    endTime: "18:00",
    city: "İstanbul",
    location: "İstanbul Kongre Merkezi",
    capacity: 500,
    price: 0,
    deadline: "2024-02-15",
    schedule: [
      { time: "09:00 - 10:00", activity: "Kayıt ve Karşılama" },
      { time: "10:00 - 10:30", activity: "Açılış Konuşmaları" },
      { time: "10:30 - 12:30", activity: "Panel Oturumları" }
    ],
    requirements: [
      "Lise öğrencisi olmak",
      "İngilizce dil yeterliliği",
      "Geçerli öğrenci belgesi"
    ],
    applicationForm: "https://forms.google.com/example",
    organizer: {
      name: "İstanbul MUN Kulübü",
      description: "2014'ten beri MUN konferansları düzenleyen öğrenci topluluğu",
      email: "info@istanbulmun.org",
      phone: "+90 555 123 4567",
      instagram: "istanbulmun",
      twitter: "istanbulmun",
      avatar: "https://placehold.co/100x100"
    }
  };
}

function showError(message) {
  // Implement error notification
  alert(message);
}
// Mock API endpoints for demonstration
const API_BASE_URL = 'https://api.cevrem.net';

// Fetch featured events
async function fetchFeaturedEvents() {
  try {
    const response = await fetch(`${API_BASE_URL}/events/featured`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching featured events:', error);
    return getMockFeaturedEvents();
  }
}

// Fetch events by category
async function fetchCategoryEvents(category) {
  try {
    const response = await fetch(`${API_BASE_URL}/events/category/${category}`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching category events:', error);
    return getMockCategoryEvents(category);
  }
}

// Search events
async function searchEvents(searchTerm) {
  try {
    const response = await fetch(`${API_BASE_URL}/events/search?q=${searchTerm}`);
    return await response.json();
  } catch (error) {
    console.error('Error searching events:', error);
    return getMockSearchResults(searchTerm);
  }
}

// Filter events
async function filterEvents(filters) {
  try {
    const queryParams = new URLSearchParams(filters);
    const response = await fetch(`${API_BASE_URL}/events/filter?${queryParams}`);
    return await response.json();
  } catch (error) {
    console.error('Error filtering events:', error);
    return getMockFilterResults(filters);
  }
}

// Mock data functions for development
function getMockFeaturedEvents() {
  return [
    {
      id: 1,
      title: "İstanbul MUN 2024",
      description: "Türkiye'nin en büyük Model Birleşmiş Milletler konferansı",
      image: "https://placehold.co/600x400",
      date: "15-17 Mart 2024",
      location: "İstanbul",
      isFree: false
    },
    {
      id: 2,
      title: "Ulusal Münazara Turnuvası",
      description: "Liseler arası münazara yarışması",
      image: "https://placehold.co/600x400",
      date: "20-22 Nisan 2024",
      location: "Ankara",
      isFree: true
    }
  ];
}

function getMockCategoryEvents(category) {
  // Return different mock events based on category
  return getMockFeaturedEvents();
}

function getMockSearchResults(searchTerm) {
  return getMockFeaturedEvents().filter(event => 
    event.title.toLowerCase().includes(searchTerm.toLowerCase())
  );
}

function getMockFilterResults(filters) {
  return getMockFeaturedEvents();
}
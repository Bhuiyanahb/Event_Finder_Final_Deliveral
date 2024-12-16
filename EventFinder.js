function changeHomePage() {
    window.location.href = "Home.html";
}

function changeAboutPage() {
    window.location.href = "About.html";
}

function changeEventsPage() {
    window.location.href = "Events.html";
}

function redirectToEvents(categoryId) {
    window.location.href = `Events.html?category=${categoryId}`;
}

document.addEventListener("DOMContentLoaded", function () {
    const categorySelect = document.getElementById('categorySelect');

    // Check if a category is passed in the URL
    const urlParams = new URLSearchParams(window.location.search);
    const selectedCategory = urlParams.get('category');

    if (selectedCategory) {
        categorySelect.value = selectedCategory; // Preselect the category
        updateFilters(); // Load events for the selected category
    }

    // Existing event listeners
    const venuesSelect = document.getElementById('venues');
    const eventDatesSelect = document.getElementById('eventDates');

    categorySelect.addEventListener('change', updateFilters);
    venuesSelect.addEventListener('change', updateFilters);
    eventDatesSelect.addEventListener('change', updateFilters);

    loadVenues();
    loadEventDates();
});

function updateFilters() {
    const category = document.getElementById('categorySelect').value;
    const venue = document.getElementById('venues').value;
    const eventDate = document.getElementById('eventDates').value;

    loadEventsByFilter(category, venue, eventDate);
}



function loadEventsByFilter(category, venue, eventDate) {
    const apiURL = 'https://app.ticketmaster.com/discovery/v2/events.json';
    const apiKey = 'n30PAv6jRNbr2Tc9nGWUWpHHPsJk7TCn';
    let url = `${apiURL}?apikey=${apiKey}&size=20`;

    if (category) url += `&classificationId=${category}`;
    if (venue) url += `&venueId=${venue}`;
    if (eventDate) {
        url += `&startDateTime=${eventDate}T00:00:00Z`;
    }

    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok: ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            if (data._embedded && data._embedded.events) {
                const filteredEvents = eventDate
                    ? data._embedded.events.filter(event => event.dates.start.localDate === eventDate)
                    : data._embedded.events;
                displayEvents(filteredEvents);
            } else {
                displayNoEventsFound();
            }
        })
        .catch(error => {
            console.error('Error fetching data: ', error);
            displayNoEventsFound();
        });
}

function displayEvents(events) {
    const eventsContainer = document.querySelector('.event-list');
    eventsContainer.innerHTML = ''; // Clear previous results

    // Sort events by date
    events.sort((a, b) => new Date(a.dates.start.localDate) - new Date(b.dates.start.localDate));

    events.forEach(event => {
        const eventEl = document.createElement('div');
        eventEl.className = 'event';
        eventEl.innerHTML = `
            <h2>${event.name}</h2>
            <p>Date: ${new Date(event.dates.start.localDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            <p>Time: ${event.dates.start.localTime ? new Date(`${event.dates.start.localDate}T${event.dates.start.localTime}`).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : 'Not specified'}</p>
            <p>Location: ${event._embedded.venues[0].name}</p>
            <a href="${event.url}" target="_blank">More Details</a>
        `;
        eventsContainer.appendChild(eventEl);
    });
}

function clearEvents() {
    const eventsContainer = document.querySelector('.event-list');
    eventsContainer.innerHTML = '<p>Select filters to view events.</p>';
}

function displayNoEventsFound() {
    const eventsContainer = document.querySelector('.event-list');
    eventsContainer.innerHTML = '<p>No events found for the selected filters.</p>';
}

function loadVenues() {
    const apiUrl = 'https://app.ticketmaster.com/discovery/v2/venues.json?apikey=n30PAv6jRNbr2Tc9nGWUWpHHPsJk7TCn';
    const selectElement = document.getElementById('venues');

    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            selectElement.innerHTML = '<option value="">No Venue Filter</option>';
            data._embedded.venues.forEach(venue => {
                const option = document.createElement('option');
                option.value = venue.id;
                option.textContent = venue.name;
                selectElement.appendChild(option);
            });
        })
        .catch(error => {
            console.error('Error fetching venues:', error);
            selectElement.innerHTML = '<option value="">Error loading venues</option>';
        });
}

function loadEventDates() {
    const apiUrl = 'https://app.ticketmaster.com/discovery/v2/events.json?apikey=n30PAv6jRNbr2Tc9nGWUWpHHPsJk7TCn';
    const selectElement = document.getElementById('eventDates');

    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            selectElement.innerHTML = '<option value="">No Date Filter</option>';
            const dates = new Set();
            data?._embedded?.events?.forEach(event => {
                dates.add(event.dates?.start?.localDate);
            });

            Array.from(dates).sort().forEach(date => {
                if (date) { 
                    const option = document.createElement('option');
                    option.value = date;
                    option.textContent = new Date(date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
                    selectElement.appendChild(option);
                }
            });
        })
        .catch(error => {
            console.error('Error fetching event dates:', error);
            selectElement.innerHTML = '<option value="">Error loading dates</option>';
        });
}


// Carousel functions (if you're still using them)
let currentIndex = 0;

function showSlide(index) {
   const slides = document.querySelector('.carousel-images');
   const dots = document.querySelectorAll('.dot');
   const totalSlides = document.querySelectorAll('.carousel-images img').length;

   if (index >= totalSlides) currentIndex = 0;
   else if (index < 0) currentIndex = totalSlides - 1;
   else currentIndex = index;

   slides.style.transform = `translateX(-${currentIndex * 100}%)`;

   dots.forEach(dot => dot.classList.remove('active'));
   dots[currentIndex].classList.add('active');
}

function changeSlide(direction) {
   showSlide(currentIndex + direction);
}

function goToSlide(index) {
   showSlide(index);
}

// Initialize the carousel
showSlide(currentIndex);
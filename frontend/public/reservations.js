// Reservations module for BrasserieBot Dashboard

// Sample reservation data
const sampleReservations = [
    {
        id: 1,
        name: "Jan Janssen",
        people: 4,
        date: "2025-03-28",
        time: "19:00",
        phone: "+31 6 12345678",
        email: "jan@example.com",
        notes: "Bij het raam a.u.b.",
        status: "confirmed"
    },
    {
        id: 2,
        name: "Petra de Vries",
        people: 2,
        date: "2025-03-28",
        time: "20:30",
        phone: "+31 6 23456789",
        email: "petra@example.com",
        notes: "Verjaardag",
        status: "confirmed"
    },
    {
        id: 3,
        name: "Willem Bakker",
        people: 6,
        date: "2025-03-29",
        time: "18:00",
        phone: "+31 6 34567890",
        email: "willem@example.com",
        notes: "Kinderen aanwezig",
        status: "pending"
    },
    {
        id: 4,
        name: "Emma Visser",
        people: 3,
        date: "2025-03-29",
        time: "19:30",
        phone: "+31 6 45678901",
        email: "emma@example.com",
        notes: "",
        status: "confirmed"
    },
    {
        id: 5,
        name: "Daan Smit",
        people: 2,
        date: "2025-03-30",
        time: "20:00",
        phone: "+31 6 56789012",
        email: "daan@example.com",
        notes: "Allergie: noten",
        status: "confirmed"
    }
];

// Initialize the reservations module
function initReservations() {
    // Load reservations from localStorage or use sample data if none exist
    let reservations = loadReservations();
    
    // Render reservations table
    renderReservationsTable(reservations);
    
    // Set up event listeners
    document.getElementById('add-reservation-btn').addEventListener('click', () => {
        showReservationModal();
    });
    
    document.getElementById('close-modal-btn').addEventListener('click', () => {
        closeReservationModal();
    });
    
    document.getElementById('reservation-form').addEventListener('submit', (e) => {
        e.preventDefault();
        addReservation();
    });
    
    // Set up date filters
    const dateFilterLinks = document.querySelectorAll('.date-filter');
    dateFilterLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const filter = e.target.getAttribute('data-filter');
            
            // Remove active class from all links
            dateFilterLinks.forEach(link => link.classList.remove('active'));
            
            // Add active class to clicked link
            e.target.classList.add('active');
            
            // Apply filter
            filterReservationsByDate(filter);
        });
    });
}

// Load reservations from localStorage
function loadReservations() {
    const storedReservations = localStorage.getItem('brasseriebot_reservations');
    
    if (storedReservations) {
        return JSON.parse(storedReservations);
    } else {
        // Store sample reservations in localStorage
        localStorage.setItem('brasseriebot_reservations', JSON.stringify(sampleReservations));
        return sampleReservations;
    }
}

// Save reservations to localStorage
function saveReservations(reservations) {
    localStorage.setItem('brasseriebot_reservations', JSON.stringify(reservations));
}

// Render reservations table
function renderReservationsTable(reservations) {
    const tableBody = document.getElementById('reservations-table-body');
    tableBody.innerHTML = '';
    
    reservations.forEach(reservation => {
        const row = document.createElement('tr');
        
        // Create status badge
        let statusClass = '';
        switch(reservation.status) {
            case 'confirmed':
                statusClass = 'badge-success';
                break;
            case 'pending':
                statusClass = 'badge-warning';
                break;
            case 'cancelled':
                statusClass = 'badge-danger';
                break;
            default:
                statusClass = 'badge-secondary';
        }
        
        // Format date for display
        const date = new Date(reservation.date);
        const formattedDate = date.toLocaleDateString('nl-NL', {
            weekday: 'short',
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
        
        row.innerHTML = `
            <td>${reservation.name}</td>
            <td>${formattedDate}</td>
            <td>${reservation.time}</td>
            <td>${reservation.people}</td>
            <td><span class="badge ${statusClass}">${reservation.status}</span></td>
            <td class="actions-cell">
                <button class="icon-btn primary" aria-label="Bewerk reservering" onclick="BrasserieBotReservations.editReservation(${reservation.id})">
                    <i data-lucide="edit"></i>
                </button>
                <button class="icon-btn danger" aria-label="Verwijder reservering" onclick="BrasserieBotReservations.deleteReservation(${reservation.id})">
                    <i data-lucide="trash-2"></i>
                </button>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
    
    // Re-initialize Lucide icons
    lucide.createIcons();
    
    // Update reservation count
    document.getElementById('reservation-count').textContent = reservations.length;
}

// Filter reservations by date
function filterReservationsByDate(filter) {
    const reservations = loadReservations();
    let filteredReservations = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    switch(filter) {
        case 'today':
            filteredReservations = reservations.filter(reservation => {
                const reservationDate = new Date(reservation.date);
                reservationDate.setHours(0, 0, 0, 0);
                return reservationDate.getTime() === today.getTime();
            });
            break;
        case 'tomorrow':
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            filteredReservations = reservations.filter(reservation => {
                const reservationDate = new Date(reservation.date);
                reservationDate.setHours(0, 0, 0, 0);
                return reservationDate.getTime() === tomorrow.getTime();
            });
            break;
        case 'week':
            const endOfWeek = new Date(today);
            endOfWeek.setDate(endOfWeek.getDate() + 7);
            filteredReservations = reservations.filter(reservation => {
                const reservationDate = new Date(reservation.date);
                reservationDate.setHours(0, 0, 0, 0);
                return reservationDate >= today && reservationDate <= endOfWeek;
            });
            break;
        case 'all':
        default:
            filteredReservations = reservations;
            break;
    }
    
    renderReservationsTable(filteredReservations);
}

// Show reservation modal
function showReservationModal(reservation = null) {
    const modal = document.getElementById('reservation-modal');
    const form = document.getElementById('reservation-form');
    
    // Reset form
    form.reset();
    
    // Set modal title
    document.getElementById('modal-title').textContent = reservation ? 'Reservering bewerken' : 'Nieuwe reservering';
    
    // Pre-fill form if editing
    if (reservation) {
        document.getElementById('reservation-id').value = reservation.id;
        document.getElementById('reservation-name').value = reservation.name;
        document.getElementById('reservation-people').value = reservation.people;
        document.getElementById('reservation-date').value = reservation.date;
        document.getElementById('reservation-time').value = reservation.time;
        document.getElementById('reservation-phone').value = reservation.phone;
        document.getElementById('reservation-email').value = reservation.email;
        document.getElementById('reservation-notes').value = reservation.notes;
        document.getElementById('reservation-status').value = reservation.status;
    } else {
        document.getElementById('reservation-id').value = '';
        // Set default date to tomorrow
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        document.getElementById('reservation-date').value = tomorrow.toISOString().split('T')[0];
    }
    
    // Show modal
    modal.classList.add('show');
}

// Close reservation modal
function closeReservationModal() {
    const modal = document.getElementById('reservation-modal');
    modal.classList.remove('show');
}

// Add or update reservation
function addReservation() {
    // Get reservation ID
    const reservationId = document.getElementById('reservation-id').value;
    
    // Get form data
    const newReservation = {
        id: reservationId ? parseInt(reservationId) : Date.now(),
        name: document.getElementById('reservation-name').value,
        people: parseInt(document.getElementById('reservation-people').value),
        date: document.getElementById('reservation-date').value,
        time: document.getElementById('reservation-time').value,
        phone: document.getElementById('reservation-phone').value,
        email: document.getElementById('reservation-email').value,
        notes: document.getElementById('reservation-notes').value,
        status: document.getElementById('reservation-status').value
    };
    
    // Get existing reservations
    let reservations = loadReservations();
    
    if (reservationId) {
        // Update existing reservation
        const index = reservations.findIndex(r => r.id === parseInt(reservationId));
        if (index !== -1) {
            reservations[index] = newReservation;
        }
    } else {
        // Add new reservation
        reservations.push(newReservation);
    }
    
    // Save updated reservations
    saveReservations(reservations);
    
    // Refresh table
    renderReservationsTable(reservations);
    
    // Close modal
    closeReservationModal();
    
    // Show success message
    showNotification(reservationId ? 'Reservering bijgewerkt' : 'Reservering toegevoegd');
}

// Edit reservation
function editReservation(id) {
    const reservations = loadReservations();
    const reservation = reservations.find(r => r.id === id);
    
    if (reservation) {
        showReservationModal(reservation);
    }
}

// Delete reservation
function deleteReservation(id) {
    if (confirm('Weet u zeker dat u deze reservering wilt verwijderen?')) {
        let reservations = loadReservations();
        reservations = reservations.filter(r => r.id !== id);
        
        // Save updated reservations
        saveReservations(reservations);
        
        // Refresh table
        renderReservationsTable(reservations);
        
        // Show success message
        showNotification('Reservering verwijderd');
    }
}

// Show notification
function showNotification(message) {
    const notification = document.getElementById('notification');
    const notificationMessage = document.getElementById('notification-message');
    
    notificationMessage.textContent = message;
    notification.classList.add('show');
    
    // Hide notification after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// Export functions
window.BrasserieBotReservations = {
    init: initReservations,
    showReservationModal: showReservationModal,
    closeReservationModal: closeReservationModal,
    addReservation: addReservation,
    editReservation: editReservation,
    deleteReservation: deleteReservation,
    filterReservationsByDate: filterReservationsByDate
};
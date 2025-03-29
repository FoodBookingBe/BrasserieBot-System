/**
 * BrasserieBot Reservations Management UI Section
 * 
 * Dit bestand genereert en beheert de UI voor reservatiebeheer
 * en integreert met supabase-reservations.js voor data handling.
 */

// Wacht tot de DOM geladen is voordat we beginnen
document.addEventListener('DOMContentLoaded', function() {
    // Controleer of we op het dashboard zijn
    if (document.querySelector('.dashboard-container')) {
        // Voeg de reserveringen sectie toe aan de pagina-inhoud
        createReservationsSection();
        
        // Initiële data laden nadat de sectie is aangemaakt
        setTimeout(() => {
            // Laad reserveringen voor vandaag standaard
            loadReservations('today');
        }, 200);
    }
});

// Functie om de reserveringen sectie toe te voegen aan de pagina
function createReservationsSection() {
    // Maak het reserveringen content element aan
    const reservationsContent = document.createElement('main');
    reservationsContent.className = 'content hidden';
    reservationsContent.id = 'reservations-content';
    
    // Genereer de HTML voor de sectie
    reservationsContent.innerHTML = `
        <div class="page-header">
            <div>
                <h1 class="page-title">Reservatiebeheer</h1>
                <p class="page-subtitle">Beheer alle reserveringen voor uw restaurant</p>
            </div>
            <div class="connection-status" id="reservations-connection-status-container">
                <span class="status-indicator"></span>
                <span id="reservations-connection-status">Verbindingsstatus controleren...</span>
            </div>
            <button class="primary-btn" id="add-reservation-btn">
                <i data-lucide="plus"></i>
                <span>Nieuwe reservering</span>
            </button>
        </div>

        <div class="stat-row">
            <div class="stat-card">
                <div class="stat-header">
                    <div>
                        <p class="stat-label">Reserveringen vandaag</p>
                        <p class="stat-value" id="today-reservations-count">-</p>
                    </div>
                    <div class="stat-icon blue">
                        <i data-lucide="calendar"></i>
                    </div>
                </div>
                <div class="stat-footer">
                    <span id="today-reservations-change" class="positive">-</span>
                </div>
            </div>

            <div class="stat-card">
                <div class="stat-header">
                    <div>
                        <p class="stat-label">Reserveringen morgen</p>
                        <p class="stat-value" id="tomorrow-reservations-count">-</p>
                    </div>
                    <div class="stat-icon green">
                        <i data-lucide="calendar-clock"></i>
                    </div>
                </div>
                <div class="stat-footer">
                    <span id="tomorrow-reservations-change" class="positive">-</span>
                </div>
            </div>

            <div class="stat-card">
                <div class="stat-header">
                    <div>
                        <p class="stat-label">Deze week</p>
                        <p class="stat-value" id="week-reservations-count">-</p>
                    </div>
                    <div class="stat-icon purple">
                        <i data-lucide="calendar-range"></i>
                    </div>
                </div>
                <div class="stat-footer">
                    <span id="week-reservations-change" class="positive">-</span>
                </div>
            </div>

            <div class="stat-card">
                <div class="stat-header">
                    <div>
                        <p class="stat-label">Beschikbare slots</p>
                        <p class="stat-value" id="available-slots-count">-</p>
                    </div>
                    <div class="stat-icon orange">
                        <i data-lucide="utensils"></i>
                    </div>
                </div>
                <div class="stat-footer">
                    <span class="neutral">Gebaseerd op restaurantcapaciteit</span>
                </div>
            </div>
        </div>

        <div class="card">
            <div class="card-header">
                <h2 class="card-title">Reserveringen</h2>
                <div class="date-filters">
                    <a href="#" class="date-filter active" data-filter="today">Vandaag</a>
                    <a href="#" class="date-filter" data-filter="tomorrow">Morgen</a>
                    <a href="#" class="date-filter" data-filter="week">Deze week</a>
                    <a href="#" class="date-filter" data-filter="all">Alle</a>
                </div>
            </div>
            
            <div class="table-actions">
                <div class="search-container small">
                    <span class="search-icon"><i data-lucide="search"></i></span>
                    <input type="text" class="search-input" id="reservation-search" placeholder="Zoek op naam, telefoonnummer...">
                </div>
                <div class="filter-actions">
                    <label for="status-filter" class="sr-only">Filter op status</label>
                    <select id="status-filter" class="input-field small" title="Filter op status">
                        <option value="">Alle statussen</option>
                        <option value="confirmed">Bevestigd</option>
                        <option value="pending">In afwachting</option>
                        <option value="cancelled">Geannuleerd</option>
                    </select>
                    <button class="outline-btn" id="export-reservations-btn">
                        <i data-lucide="download"></i>
                        <span>Exporteren</span>
                    </button>
                </div>
            </div>
            
            <div class="table-container" id="reservations-table-container">
                <table class="data-table" id="reservations-table">
                    <thead>
                        <tr>
                            <th>Naam</th>
                            <th>Datum & Tijd</th>
                            <th>Personen</th>
                            <th>Contact</th>
                            <th>Status</th>
                            <th class="actions-column">Acties</th>
                        </tr>
                    </thead>
                    <tbody id="reservations-table-body">
                        <!-- Hier worden reserveringen dynamisch ingevoegd -->
                        <tr>
                            <td colspan="6" class="loading-message">Reserveringen laden...</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Reservering Toevoegen/Bewerken Modal -->
        <div class="modal" id="reservation-modal">
            <div class="modal-content">
                <div class="modal-header">
                    <h2 id="reservation-modal-title">Nieuwe reservering</h2>
                    <button class="close-btn" id="close-reservation-modal">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="reservation-form">
                        <input type="hidden" id="reservation-id">
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label for="reservation-name">Naam *</label>
                                <input type="text" id="reservation-name" class="input-field" required>
                            </div>
                            <div class="form-group">
                                <label for="reservation-people">Aantal personen *</label>
                                <input type="number" id="reservation-people" class="input-field" min="1" max="20" required>
                            </div>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label for="reservation-date">Datum *</label>
                                <input type="date" id="reservation-date" class="input-field" required>
                            </div>
                            <div class="form-group">
                                <label for="reservation-time">Tijd *</label>
                                <input type="time" id="reservation-time" class="input-field" required>
                            </div>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label for="reservation-phone">Telefoonnummer *</label>
                                <input type="tel" id="reservation-phone" class="input-field" required>
                            </div>
                            <div class="form-group">
                                <label for="reservation-email">E-mail</label>
                                <input type="email" id="reservation-email" class="input-field">
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label for="reservation-notes">Notities</label>
                            <textarea id="reservation-notes" class="input-field" rows="3"></textarea>
                        </div>
                        
                        <div class="form-group">
                            <label for="reservation-status">Status *</label>
                            <select id="reservation-status" class="input-field" required>
                                <option value="confirmed">Bevestigd</option>
                                <option value="pending">In afwachting</option>
                                <option value="cancelled">Geannuleerd</option>
                            </select>
                        </div>
                        
                        <div class="form-actions">
                            <button type="button" class="secondary-btn" id="cancel-reservation-btn">Annuleren</button>
                            <button type="submit" class="primary-btn" id="save-reservation-btn">Opslaan</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;
    
    // Voeg de sectie toe aan de main-content container
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
        mainContent.appendChild(reservationsContent);
        
        // Initialiseer Lucide iconen
        if (window.lucide) {
            lucide.createIcons();
        }
        
        // Event listeners toevoegen
        setupReservationEventListeners();
    }
}

// Event listeners voor de reserveringen sectie
function setupReservationEventListeners() {
    // Filter links voor datums
    const dateFilters = document.querySelectorAll('.date-filter');
    dateFilters.forEach(filter => {
        filter.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Verwijder active class van alle filters
            dateFilters.forEach(f => f.classList.remove('active'));
            
            // Voeg active class toe aan deze filter
            this.classList.add('active');
            
            // Haal het filter type op
            const filterType = this.getAttribute('data-filter');
            
            // Laad reserveringen met dit filter
            loadReservations(filterType);
        });
    });
    
    // Zoeken in reserveringen
    const searchInput = document.getElementById('reservation-search');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(function() {
            filterReservationsTable();
        }, 300));
    }
    
    // Status filter
    const statusFilter = document.getElementById('status-filter');
    if (statusFilter) {
        statusFilter.addEventListener('change', function() {
            filterReservationsTable();
        });
    }
    
    // Nieuwe reservering knop
    const addButton = document.getElementById('add-reservation-btn');
    if (addButton) {
        addButton.addEventListener('click', function() {
            openReservationModal();
        });
    }
    
    // Exporteren knop
    const exportButton = document.getElementById('export-reservations-btn');
    if (exportButton) {
        exportButton.addEventListener('click', function() {
            exportReservations();
        });
    }
    
    // Modal event listeners
    const closeModalButton = document.getElementById('close-reservation-modal');
    if (closeModalButton) {
        closeModalButton.addEventListener('click', function() {
            closeReservationModal();
        });
    }
    
    const cancelButton = document.getElementById('cancel-reservation-btn');
    if (cancelButton) {
        cancelButton.addEventListener('click', function() {
            closeReservationModal();
        });
    }
    
    // Form submission
    const reservationForm = document.getElementById('reservation-form');
    if (reservationForm) {
        reservationForm.addEventListener('submit', function(e) {
            e.preventDefault();
            saveReservation();
        });
    }
    
    // Zet huidige datum als default voor nieuwe reserveringen
    const dateInput = document.getElementById('reservation-date');
    if (dateInput) {
        const today = new Date().toISOString().split('T')[0];
        dateInput.value = today;
        dateInput.min = today; // Voorkom reserveringen in het verleden
    }
}

// Laad reserveringen op basis van een filter
function loadReservations(filterType) {
    // Haal de reserveringen handler op
    let reservationsHandler;
    if (typeof BrasserieBotSupabaseReservations !== 'undefined') {
        reservationsHandler = window.BrasserieBotSupabaseReservations;
    } else if (typeof BrasserieBotReservations !== 'undefined') {
        reservationsHandler = window.BrasserieBotReservations;
    }
    
    if (!reservationsHandler) {
        console.error('Geen reserveringen handler beschikbaar');
        showNoReservationsMessage('Error: Reserveringen systeem niet beschikbaar');
        return;
    }
    
    // Toon laad bericht
    document.getElementById('reservations-table-body').innerHTML = `
        <tr><td colspan="6" class="loading-message">Reserveringen laden...</td></tr>
    `;
    
    // Zet het filter om in een datum object
    let filter = {};
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    switch (filterType) {
        case 'today':
            filter.date = todayStr;
            break;
            
        case 'tomorrow':
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            filter.date = tomorrow.toISOString().split('T')[0];
            break;
            
        case 'week':
            const startOfWeek = new Date(today);
            const endOfWeek = new Date(today);
            
            // Bepaal start en eind van de week (maandag-zondag)
            const dayOfWeek = today.getDay(); // 0 = zondag, 1 = maandag, etc.
            const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
            
            startOfWeek.setDate(diff);
            endOfWeek.setDate(diff + 6);
            
            filter.dateStart = startOfWeek.toISOString().split('T')[0];
            filter.dateEnd = endOfWeek.toISOString().split('T')[0];
            break;
            
        case 'all':
        default:
            // Geen filter, alle reserveringen
            filter = {};
            break;
    }
    
    // Haal reserveringen op met filter
    reservationsHandler.getReservations(filter)
        .then(reservations => {
            // Update de statistieken
            updateReservationStats(reservationsHandler);
            
            // Render de reserveringen tabel
            renderReservationsTable(reservations);
        })
        .catch(error => {
            console.error('Fout bij ophalen reserveringen:', error);
            showNoReservationsMessage('Error: Kon reserveringen niet laden');
        });
}

// Deze functie wordt gebruikt door externe modules en is beschikbaar in de global scope
window.filterReservationsByDate = function(filter, reservationsHandler) {
  if (reservationsHandler) {
    const reservations = reservationsHandler.getReservations(filter);
    renderReservationsTable(reservations);
  } else if (typeof BrasserieBotReservations !== 'undefined') {
    const reservations = BrasserieBotReservations.getReservations(filter);
    renderReservationsTable(reservations);
  } else if (typeof BrasserieBotSupabaseReservations !== 'undefined') {
    const reservations = BrasserieBotSupabaseReservations.getReservations(filter);
    renderReservationsTable(reservations);
  } else {
    showNoReservationsMessage('Error: Reserveringen systeem niet beschikbaar');
  }
}

// Render de reserveringen tabel
function renderReservationsTable(reservations) {
    const tableBody = document.getElementById('reservations-table-body');
    
    if (!tableBody) return;
    
    // Controleer of er reserveringen zijn
    if (!reservations || reservations.length === 0) {
        showNoReservationsMessage('Geen reserveringen gevonden voor deze periode');
        return;
    }
    
    // Leeg de tabel
    tableBody.innerHTML = '';
    
    // Voeg elke reservering toe aan de tabel
    reservations.forEach(reservation => {
        const row = document.createElement('tr');
        
        // Voeg data attribute toe voor filteren
        row.setAttribute('data-name', reservation.name.toLowerCase());
        row.setAttribute('data-phone', reservation.phone || '');
        row.setAttribute('data-email', reservation.email || '');
        row.setAttribute('data-status', reservation.status || 'pending');
        
        // Maak de cellen voor deze rij
        row.innerHTML = `
            <td>
                <div class="table-cell-with-icon">
                    <i data-lucide="user"></i>
                    <span>${reservation.name}</span>
                </div>
            </td>
            <td>
                <div class="reservation-datetime">
                    <span class="reservation-date">${formatDate(reservation.date)}</span>
                    <span class="reservation-time">${formatTime(reservation.time)}</span>
                </div>
            </td>
            <td>${reservation.people} ${reservation.people > 1 ? 'personen' : 'persoon'}</td>
            <td>
                <div class="reservation-contact">
                    ${reservation.phone ? `<span class="reservation-phone">${reservation.phone}</span>` : ''}
                    ${reservation.email ? `<span class="reservation-email">${reservation.email}</span>` : ''}
                </div>
            </td>
            <td>
                <span class="status-badge ${reservation.status || 'pending'}">${getStatusLabel(reservation.status)}</span>
            </td>
            <td class="actions-cell">
                <button class="icon-btn primary edit-reservation-btn" title="Bewerk reservering" data-id="${reservation.id}">
                    <i data-lucide="edit"></i>
                </button>
                <button class="icon-btn danger delete-reservation-btn" title="Verwijder reservering" data-id="${reservation.id}">
                    <i data-lucide="trash-2"></i>
                </button>
            </td>
        `;
        
        // Voeg de rij toe aan de tabel
        tableBody.appendChild(row);
    });
    
    // Initialiseer Lucide iconen
    if (window.lucide) {
        lucide.createIcons();
    }
    
    // Voeg event listeners toe aan knoppen
    setupReservationRowListeners();
}

// Event listeners voor rijen in de tabel
function setupReservationRowListeners() {
    // Bewerk knoppen
    const editButtons = document.querySelectorAll('.edit-reservation-btn');
    editButtons.forEach(button => {
        button.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            editReservation(id);
        });
    });
    
    // Verwijder knoppen
    const deleteButtons = document.querySelectorAll('.delete-reservation-btn');
    deleteButtons.forEach(button => {
        button.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            confirmDeleteReservation(id);
        });
    });
}

// Filter de reserveringen tabel op basis van zoekopdracht en status
function filterReservationsTable() {
    const searchInput = document.getElementById('reservation-search');
    const statusFilter = document.getElementById('status-filter');
    const tableRows = document.querySelectorAll('#reservations-table-body tr');
    
    if (!searchInput || !statusFilter || !tableRows.length) return;
    
    const searchTerm = searchInput.value.toLowerCase();
    const statusTerm = statusFilter.value.toLowerCase();
    
    let visibleCount = 0;
    
    tableRows.forEach(row => {
        // Sla de "geen reserveringen" rij over
        if (row.classList.contains('no-reservations')) {
            row.style.display = 'none';
            return;
        }
        
        const name = row.getAttribute('data-name') || '';
        const phone = row.getAttribute('data-phone') || '';
        const email = row.getAttribute('data-email') || '';
        const status = row.getAttribute('data-status') || '';
        
        // Check of de rij overeenkomt met filter criteria
        const matchesSearch = name.includes(searchTerm) || 
                             phone.includes(searchTerm) || 
                             email.includes(searchTerm);
        
        const matchesStatus = !statusTerm || status === statusTerm;
        
        // Toon of verberg de rij
        if (matchesSearch && matchesStatus) {
            row.style.display = '';
            visibleCount++;
        } else {
            row.style.display = 'none';
        }
    });
    
    // Als er geen reserveringen zichtbaar zijn, toon bericht
    if (visibleCount === 0) {
        const tableBody = document.getElementById('reservations-table-body');
        
        // Check of er al een "geen resultaten" rij is
        const noResultsRow = tableBody.querySelector('.no-results');
        
        if (!noResultsRow) {
            const row = document.createElement('tr');
            row.className = 'no-results';
            row.innerHTML = `
                <td colspan="6" class="empty-message">
                    Geen reserveringen gevonden met deze zoekcriteria
                </td>
            `;
            tableBody.appendChild(row);
        } else {
            noResultsRow.style.display = '';
        }
    } else {
        // Verberg de "geen resultaten" rij als die er is
        const noResultsRow = document.querySelector('.no-results');
        if (noResultsRow) {
            noResultsRow.style.display = 'none';
        }
    }
}

// Update de reserveringen statistieken
function updateReservationStats(reservationsHandler) {
    if (!reservationsHandler) return;
    
    // Haal statistieken op
    Promise.all([
        reservationsHandler.getTodayReservationsCount(),
        reservationsHandler.getTomorrowReservationsCount(),
        reservationsHandler.getThisWeekReservationsCount()
    ]).then(([todayCount, tomorrowCount, weekCount]) => {
        // Update de UI
        const todayEl = document.getElementById('today-reservations-count');
        const tomorrowEl = document.getElementById('tomorrow-reservations-count');
        const weekEl = document.getElementById('week-reservations-count');
        
        if (todayEl) todayEl.textContent = todayCount;
        if (tomorrowEl) tomorrowEl.textContent = tomorrowCount;
        if (weekEl) weekEl.textContent = weekCount;
        
        // Bereken beschikbare slots (aanname: 60 slots per dag)
        const availableSlotsEl = document.getElementById('available-slots-count');
        if (availableSlotsEl) {
            const maxCapacity = 60;
            const availableToday = Math.max(0, maxCapacity - todayCount);
            availableSlotsEl.textContent = availableToday;
        }
    }).catch(error => {
        console.error('Fout bij ophalen reserveringsstatistieken:', error);
    });
}

// Toon een bericht als er geen reserveringen zijn
function showNoReservationsMessage(message) {
    const tableBody = document.getElementById('reservations-table-body');
    
    if (tableBody) {
        tableBody.innerHTML = `
            <tr class="no-reservations">
                <td colspan="6" class="empty-message">
                    ${message}
                </td>
            </tr>
        `;
    }
}

// Modal functies
function openReservationModal(reservationData = null) {
    const modal = document.getElementById('reservation-modal');
    const modalTitle = document.getElementById('reservation-modal-title');
    const form = document.getElementById('reservation-form');
    
    if (!modal || !modalTitle || !form) return;
    
    // Reset form
    form.reset();
    
    if (reservationData) {
        // Bewerken modus
        modalTitle.textContent = 'Reservering bewerken';
        
        // Vul form met bestaande data
        document.getElementById('reservation-id').value = reservationData.id;
        document.getElementById('reservation-name').value = reservationData.name;
        document.getElementById('reservation-people').value = reservationData.people;
        document.getElementById('reservation-date').value = reservationData.date;
        document.getElementById('reservation-time').value = reservationData.time;
        document.getElementById('reservation-phone').value = reservationData.phone || '';
        document.getElementById('reservation-email').value = reservationData.email || '';
        document.getElementById('reservation-notes').value = reservationData.notes || '';
        document.getElementById('reservation-status').value = reservationData.status || 'pending';
    } else {
        // Nieuwe reservering modus
        modalTitle.textContent = 'Nieuwe reservering';
        document.getElementById('reservation-id').value = '';
        
        // Zet standaard waarden voor een nieuwe reservering
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('reservation-date').value = today;
        document.getElementById('reservation-status').value = 'confirmed';
    }
    
    // Toon modal
    modal.classList.add('show');
}

function closeReservationModal() {
    const modal = document.getElementById('reservation-modal');
    if (modal) {
        modal.classList.remove('show');
    }
}

// Haal een specifieke reservering op voor bewerken
function editReservation(id) {
    // Haal de reserveringen handler op
    let reservationsHandler;
    if (typeof BrasserieBotSupabaseReservations !== 'undefined') {
        reservationsHandler = window.BrasserieBotSupabaseReservations;
    } else if (typeof BrasserieBotReservations !== 'undefined') {
        reservationsHandler = window.BrasserieBotReservations;
    }
    
    if (!reservationsHandler) {
        console.error('Geen reserveringen handler beschikbaar');
        return;
    }
    
    // Haal alle reserveringen op zodat we de juiste kunnen vinden
    reservationsHandler.getReservations()
        .then(reservations => {
            const reservation = reservations.find(r => r.id === id);
            
            if (reservation) {
                openReservationModal(reservation);
            } else {
                console.error('Reservering niet gevonden:', id);
                showNotification('Reservering niet gevonden', true);
            }
        })
        .catch(error => {
            console.error('Fout bij ophalen reservering:', error);
            showNotification('Fout bij ophalen reservering', true);
        });
}

// Bevestig verwijderen van een reservering
function confirmDeleteReservation(id) {
    if (confirm('Weet u zeker dat u deze reservering wilt verwijderen?')) {
        deleteReservation(id);
    }
}

// Verwijder een reservering
function deleteReservation(id) {
    // Haal de reserveringen handler op
    let reservationsHandler;
    if (typeof BrasserieBotSupabaseReservations !== 'undefined') {
        reservationsHandler = window.BrasserieBotSupabaseReservations;
    } else if (typeof BrasserieBotReservations !== 'undefined') {
        reservationsHandler = window.BrasserieBotReservations;
    }
    
    if (!reservationsHandler) {
        console.error('Geen reserveringen handler beschikbaar');
        showNotification('Reserveringen systeem niet beschikbaar', true);
        return;
    }
    
    // Haal huidige filter op om later alle reserveringen opnieuw te laden
    const activeFilter = document.querySelector('.date-filter.active');
    const filterType = activeFilter ? activeFilter.getAttribute('data-filter') : 'today';
    
    // Verwijder de reservering
    reservationsHandler.deleteReservation(id)
        .then(success => {
            if (success) {
                showNotification('Reservering succesvol verwijderd');
                
                // Herlaad reserveringen met huidige filter
                loadReservations(filterType);
            } else {
                showNotification('Kon reservering niet verwijderen', true);
            }
        })
        .catch(error => {
            console.error('Fout bij verwijderen reservering:', error);
            showNotification('Fout bij verwijderen reservering', true);
        });
}

// Sla een reservering op (nieuw of bestaand)
function saveReservation() {
    // Haal form data op
    const id = document.getElementById('reservation-id').value;
    const name = document.getElementById('reservation-name').value;
    const people = parseInt(document.getElementById('reservation-people').value);
    const date = document.getElementById('reservation-date').value;
    const time = document.getElementById('reservation-time').value;
    const phone = document.getElementById('reservation-phone').value;
    const email = document.getElementById('reservation-email').value;
    const notes = document.getElementById('reservation-notes').value;
    const status = document.getElementById('reservation-status').value;
    
    // Basic validatie
    if (!name || !people || !date || !time || !phone || !status) {
        showNotification('Vul alle verplichte velden in', true);
        return;
    }
    
    // Maak reservering object
    const reservation = {
        name,
        people,
        date,
        time,
        phone,
        email,
        notes,
        status
    };
    
    // Haal de reserveringen handler op
    let reservationsHandler;
    if (typeof BrasserieBotSupabaseReservations !== 'undefined') {
        reservationsHandler = window.BrasserieBotSupabaseReservations;
    } else if (typeof BrasserieBotReservations !== 'undefined') {
        reservationsHandler = window.BrasserieBotReservations;
    }
    
    if (!reservationsHandler) {
        console.error('Geen reserveringen handler beschikbaar');
        showNotification('Reserveringen systeem niet beschikbaar', true);
        return;
    }
    
    // Haal huidige filter op om later alle reserveringen opnieuw te laden
    const activeFilter = document.querySelector('.date-filter.active');
    const filterType = activeFilter ? activeFilter.getAttribute('data-filter') : 'today';
    
    // Update bestaande of voeg nieuw toe
    if (id) {
        // Update bestaande reservering
        reservation.id = id;
        
        reservationsHandler.updateReservation(id, reservation)
            .then(updated => {
                if (updated) {
                    showNotification('Reservering succesvol bijgewerkt');
                    closeReservationModal();
                    
                    // Herlaad reserveringen met huidige filter
                    loadReservations(filterType);
                } else {
                    showNotification('Kon reservering niet bijwerken', true);
                }
            })
            .catch(error => {
                console.error('Fout bij bijwerken reservering:', error);
                showNotification('Fout bij bijwerken reservering', true);
            });
    } else {
        // Voeg nieuwe reservering toe
        reservationsHandler.addReservation(reservation)
            .then(added => {
                if (added) {
                    showNotification('Reservering succesvol toegevoegd');
                    closeReservationModal();
                    
                    // Herlaad reserveringen met huidige filter
                    loadReservations(filterType);
                } else {
                    showNotification('Kon reservering niet toevoegen', true);
                }
            })
            .catch(error => {
                console.error('Fout bij toevoegen reservering:', error);
                showNotification('Fout bij toevoegen reservering', true);
            });
    }
}

// Exporteer reserveringen naar CSV
function exportReservations() {
    // Haal de reserveringen handler op
    let reservationsHandler;
    if (typeof BrasserieBotSupabaseReservations !== 'undefined') {
        reservationsHandler = window.BrasserieBotSupabaseReservations;
    } else if (typeof BrasserieBotReservations !== 'undefined') {
        reservationsHandler = window.BrasserieBotReservations;
    }
    
    if (!reservationsHandler) {
        console.error('Geen reserveringen handler beschikbaar');
        showNotification('Reserveringen systeem niet beschikbaar', true);
        return;
    }
    
    // Haal alle reserveringen op
    reservationsHandler.getReservations()
        .then(reservations => {
            if (!reservations || reservations.length === 0) {
                showNotification('Geen reserveringen om te exporteren', true);
                return;
            }
            
            // Maak CSV inhoud
            const headers = ['Naam', 'Personen', 'Datum', 'Tijd', 'Telefoon', 'Email', 'Notities', 'Status'];
            let csv = headers.join(',') + '\n';
            
            reservations.forEach(r => {
                const row = [
                    `"${r.name.replace(/"/g, '""')}"`,
                    r.people,
                    r.date,
                    r.time,
                    `"${(r.phone || '').replace(/"/g, '""')}"`,
                    `"${(r.email || '').replace(/"/g, '""')}"`,
                    `"${(r.notes || '').replace(/"/g, '""')}"`,
                    `"${(r.status || 'pending').replace(/"/g, '""')}"`
                ];
                
                csv += row.join(',') + '\n';
            });
            
            // Maak download link
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            
            link.setAttribute('href', url);
            link.setAttribute('download', `reserveringen-${new Date().toISOString().split('T')[0]}.csv`);
            link.style.display = 'none';
            
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            showNotification('Reserveringen geëxporteerd naar CSV');
        })
        .catch(error => {
            console.error('Fout bij exporteren reserveringen:', error);
            showNotification('Fout bij exporteren reserveringen', true);
        });
}

// Hulpfuncties
function formatDate(dateStr) {
    if (!dateStr) return '';
    
    const date = new Date(dateStr);
    
    // Fix voor timezone issues
    date.setMinutes(date.getMinutes() + date.getTimezoneOffset());
    
    return date.toLocaleDateString('nl-NL', {
        weekday: 'short',
        day: 'numeric',
        month: 'long'
    });
}

function formatTime(timeStr) {
    if (!timeStr) return '';
    
    // Als het al geformatteerd is als HH:MM
    if (/^\d{2}:\d{2}$/.test(timeStr)) {
        return timeStr;
    }
    
    // Anders aanname dat het een datum string is
    const date = new Date(timeStr);
    return date.toLocaleTimeString('nl-NL', {
        hour: '2-digit',
        minute: '2-digit'
    });
}

function getStatusLabel(status) {
    switch (status) {
        case 'confirmed':
            return 'Bevestigd';
        case 'cancelled':
            return 'Geannuleerd';
        case 'pending':
        default:
            return 'In afwachting';
    }
}

function showNotification(message, isError = false) {
    // Controleer of er al een notification element is
    let notification = document.querySelector('.notification');
    
    if (!notification) {
        // Maak nieuwe notification
        notification = document.createElement('div');
        notification.className = 'notification';
        document.body.appendChild(notification);
    }
    
    // Set content en styling
    notification.textContent = message;
    notification.classList.toggle('error', isError);
    
    // Toon notification
    notification.classList.add('show');
    
    // Verberg na 3 seconden
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// Debounce functie voor zoeken
function debounce(func, wait) {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            func(...args);
        }, wait);
    };
}
/**
 * BrasserieBot Reservations module with Supabase integration
 * This module replaces the localStorage implementation with Supabase database storage
 */

// Initialize the reservations module with Supabase
function initSupabaseReservations() {
    console.log('Initializing Supabase Reservations Module');
    
    // First, ensure Supabase client is initialized
    if (!supabaseClient.isAvailable()) {
        console.log('Supabase client not initialized, initializing now...');
        supabaseClient.init()
            .then(() => {
                console.log('Supabase client initialized, loading reservations');
                loadReservationsFromSupabase();
            })
            .catch(error => {
                console.error('Failed to initialize Supabase client:', error);
                // Fall back to local sample data
                loadSampleReservations();
            });
    } else {
        // Supabase already initialized, load reservations
        loadReservationsFromSupabase();
    }
    
    // Set up event listeners
    document.getElementById('add-reservation-btn').addEventListener('click', () => {
        showReservationModal();
    });
    
    document.getElementById('close-modal-btn').addEventListener('click', () => {
        closeReservationModal();
    });
    
    document.getElementById('reservation-form').addEventListener('submit', (e) => {
        e.preventDefault();
        addReservationToSupabase();
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

// Sample reservation data for fallback
const sampleReservations = [
    {
        id: '1',
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
        id: '2',
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
        id: '3',
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
        id: '4',
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
        id: '5',
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

// Load sample reservations as fallback
function loadSampleReservations() {
    console.log('Loading sample reservations (fallback mode)');
    renderReservationsTable(sampleReservations);
    showConnectionError();
}

// Show connection error notification
function showConnectionError() {
    showNotification('Geen verbinding met database. Lokale gegevens worden gebruikt.', 'warning', 5000);
}

// Load reservations from Supabase
async function loadReservationsFromSupabase() {
    try {
        showLoadingIndicator(true);
        
        // Get current restaurant ID (for demo we'll use a fixed ID)
        const restaurantId = getActiveRestaurantId();
        
        // Get Supabase client
        const client = supabaseClient.getClient();
        
        if (!client) {
            console.error('Supabase client not available');
            loadSampleReservations();
            return;
        }
        
        // Query reservations table
        const { data, error } = await client
            .from('reservations')
            .select('*')
            .eq('restaurant_id', restaurantId)
            .order('reservation_date', { ascending: true })
            .order('reservation_time', { ascending: true });
        
        if (error) {
            console.error('Error fetching reservations:', error);
            loadSampleReservations();
            return;
        }
        
        if (data && data.length > 0) {
            console.log('Loaded', data.length, 'reservations from Supabase');
            
            // Transform data to match our expected format
            const formattedReservations = data.map(reservation => ({
                id: reservation.id,
                name: reservation.customer_name,
                people: reservation.party_size,
                date: reservation.reservation_date,
                time: reservation.reservation_time,
                phone: reservation.customer_phone,
                email: reservation.customer_email,
                notes: reservation.special_requests,
                status: reservation.status
            }));
            
            renderReservationsTable(formattedReservations);
            showNotification('Reserveringen geladen vanuit database', 'success');
        } else {
            console.log('No reservations found in database, showing samples');
            loadSampleReservations();
        }
    } catch (error) {
        console.error('Error in loadReservationsFromSupabase:', error);
        loadSampleReservations();
    } finally {
        showLoadingIndicator(false);
    }
}

// Helper function to get current restaurant ID
function getActiveRestaurantId() {
    // In a real app, this would come from the user's session or URL
    // For demo, we'll use a fixed ID
    return 'e42c7ce0-4c77-4d9c-8426-32d65d6a3c5e';
}

// Show/hide loading indicator
function showLoadingIndicator(show) {
    const loadingIndicator = document.getElementById('loading-indicator');
    if (loadingIndicator) {
        loadingIndicator.style.display = show ? 'flex' : 'none';
    }
}

// Render reservations table
function renderReservationsTable(reservations) {
    const tableBody = document.getElementById('reservations-table-body');
    tableBody.innerHTML = '';
    
    if (!reservations || reservations.length === 0) {
        const emptyRow = document.createElement('tr');
        emptyRow.innerHTML = `<td colspan="6" class="text-center py-4">Geen reserveringen gevonden</td>`;
        tableBody.appendChild(emptyRow);
        document.getElementById('reservation-count').textContent = '0';
        return;
    }
    
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
                <button class="icon-btn primary" aria-label="Bewerk reservering" onclick="BrasserieBotSupabaseReservations.editReservation('${reservation.id}')">
                    <i data-lucide="edit"></i>
                </button>
                <button class="icon-btn danger" aria-label="Verwijder reservering" onclick="BrasserieBotSupabaseReservations.deleteReservation('${reservation.id}')">
                    <i data-lucide="trash-2"></i>
                </button>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
    
    // Re-initialize Lucide icons
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
        lucide.createIcons();
    }
    
    // Update reservation count
    document.getElementById('reservation-count').textContent = reservations.length;
}

// Filter reservations by date
function filterReservationsByDate(filter) {
    // Get Supabase client
    const client = supabaseClient.getClient();
    
    if (!client) {
        console.error('Supabase client not available');
        return;
    }
    
    showLoadingIndicator(true);
    
    // Get current restaurant ID
    const restaurantId = getActiveRestaurantId();
    
    // Build query
    let query = client
        .from('reservations')
        .select('*')
        .eq('restaurant_id', restaurantId);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split('T')[0];
    
    switch(filter) {
        case 'today':
            query = query.eq('reservation_date', todayStr);
            break;
        case 'tomorrow':
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            const tomorrowStr = tomorrow.toISOString().split('T')[0];
            query = query.eq('reservation_date', tomorrowStr);
            break;
        case 'week':
            const endOfWeek = new Date(today);
            endOfWeek.setDate(endOfWeek.getDate() + 7);
            const endOfWeekStr = endOfWeek.toISOString().split('T')[0];
            query = query.gte('reservation_date', todayStr)
                         .lte('reservation_date', endOfWeekStr);
            break;
        case 'all':
        default:
            // No additional filter, return all
            break;
    }
    
    // Order results
    query = query.order('reservation_date', { ascending: true })
                .order('reservation_time', { ascending: true });
    
    // Execute query
    query.then(({ data, error }) => {
        showLoadingIndicator(false);
        
        if (error) {
            console.error('Error filtering reservations:', error);
            showNotification('Fout bij het filteren van reserveringen', 'error');
            return;
        }
        
        if (data) {
            console.log(`Loaded ${data.length} reservations with filter: ${filter}`);
            
            // Transform data to match our expected format
            const formattedReservations = data.map(reservation => ({
                id: reservation.id,
                name: reservation.customer_name,
                people: reservation.party_size,
                date: reservation.reservation_date,
                time: reservation.reservation_time,
                phone: reservation.customer_phone,
                email: reservation.customer_email,
                notes: reservation.special_requests,
                status: reservation.status
            }));
            
            renderReservationsTable(formattedReservations);
        }
    });
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

// Edit reservation
async function editReservation(id) {
    // Get Supabase client
    const client = supabaseClient.getClient();
    
    if (!client) {
        console.error('Supabase client not available');
        showNotification('Database niet beschikbaar', 'error');
        return;
    }
    
    try {
        showLoadingIndicator(true);
        
        // Query reservation
        const { data, error } = await client
            .from('reservations')
            .select('*')
            .eq('id', id)
            .single();
        
        if (error) {
            console.error('Error fetching reservation:', error);
            showNotification('Fout bij ophalen reservering', 'error');
            return;
        }
        
        if (data) {
            const reservation = {
                id: data.id,
                name: data.customer_name,
                people: data.party_size,
                date: data.reservation_date,
                time: data.reservation_time,
                phone: data.customer_phone,
                email: data.customer_email,
                notes: data.special_requests,
                status: data.status
            };
            
            showReservationModal(reservation);
        } else {
            showNotification('Reservering niet gevonden', 'error');
        }
    } catch (error) {
        console.error('Error in editReservation:', error);
        showNotification('Fout bij bewerken reservering', 'error');
    } finally {
        showLoadingIndicator(false);
    }
}

// Add or update reservation to Supabase
async function addReservationToSupabase() {
    // Get Supabase client
    const client = supabaseClient.getClient();
    
    if (!client) {
        console.error('Supabase client not available');
        showNotification('Database niet beschikbaar', 'error');
        return;
    }
    
    // Get reservation ID
    const reservationId = document.getElementById('reservation-id').value;
    
    // Get form data
    const reservationData = {
        restaurant_id: getActiveRestaurantId(),
        customer_name: document.getElementById('reservation-name').value,
        party_size: parseInt(document.getElementById('reservation-people').value),
        reservation_date: document.getElementById('reservation-date').value,
        reservation_time: document.getElementById('reservation-time').value,
        customer_phone: document.getElementById('reservation-phone').value,
        customer_email: document.getElementById('reservation-email').value,
        special_requests: document.getElementById('reservation-notes').value,
        status: document.getElementById('reservation-status').value,
        updated_at: new Date().toISOString()
    };
    
    try {
        showLoadingIndicator(true);
        
        if (reservationId) {
            // Update existing reservation
            const { data, error } = await client
                .from('reservations')
                .update(reservationData)
                .eq('id', reservationId)
                .select();
            
            if (error) {
                console.error('Error updating reservation:', error);
                showNotification('Fout bij bijwerken reservering', 'error');
                return;
            }
            
            console.log('Updated reservation:', data);
            showNotification('Reservering bijgewerkt', 'success');
        } else {
            // Add new reservation
            const { data, error } = await client
                .from('reservations')
                .insert([{ ...reservationData, created_at: new Date().toISOString() }])
                .select();
            
            if (error) {
                console.error('Error creating reservation:', error);
                showNotification('Fout bij maken reservering', 'error');
                return;
            }
            
            console.log('Created reservation:', data);
            showNotification('Reservering toegevoegd', 'success');
        }
        
        // Close modal
        closeReservationModal();
        
        // Refresh reservations
        loadReservationsFromSupabase();
    } catch (error) {
        console.error('Error in addReservationToSupabase:', error);
        showNotification('Fout bij opslaan reservering', 'error');
    } finally {
        showLoadingIndicator(false);
    }
}

// Delete reservation
async function deleteReservation(id) {
    if (!confirm('Weet u zeker dat u deze reservering wilt verwijderen?')) {
        return;
    }
    
    // Get Supabase client
    const client = supabaseClient.getClient();
    
    if (!client) {
        console.error('Supabase client not available');
        showNotification('Database niet beschikbaar', 'error');
        return;
    }
    
    try {
        showLoadingIndicator(true);
        
        // Delete reservation
        const { error } = await client
            .from('reservations')
            .delete()
            .eq('id', id);
        
        if (error) {
            console.error('Error deleting reservation:', error);
            showNotification('Fout bij verwijderen reservering', 'error');
            return;
        }
        
        console.log('Deleted reservation:', id);
        showNotification('Reservering verwijderd', 'success');
        
        // Refresh reservations
        loadReservationsFromSupabase();
    } catch (error) {
        console.error('Error in deleteReservation:', error);
        showNotification('Fout bij verwijderen reservering', 'error');
    } finally {
        showLoadingIndicator(false);
    }
}

// Show notification with type
function showNotification(message, type = 'success', duration = 3000) {
    const notification = document.getElementById('notification');
    const notificationMessage = document.getElementById('notification-message');
    
    // Remove existing type classes
    notification.classList.remove('success', 'error', 'warning', 'info');
    
    // Add type class
    notification.classList.add(type);
    
    notificationMessage.textContent = message;
    notification.classList.add('show');
    
    // Hide notification after duration
    setTimeout(() => {
        notification.classList.remove('show');
    }, duration);
}

// Export functions
window.BrasserieBotSupabaseReservations = {
    init: initSupabaseReservations,
    showReservationModal: showReservationModal,
    closeReservationModal: closeReservationModal,
    addReservation: addReservationToSupabase,
    editReservation: editReservation,
    deleteReservation: deleteReservation,
    filterReservationsByDate: filterReservationsByDate
};
// Dashboard JavaScript

// DOM Elements
const sidebar = document.querySelector('.sidebar');
const mainContent = document.querySelector('.main-content');
const navLinks = document.querySelectorAll('.sidebar-nav a');
const contentSections = document.querySelectorAll('.content');
const tabButtons = document.querySelectorAll('.tab');
const menuToggle = document.getElementById('menu-toggle');
const searchToggle = document.getElementById('search-toggle');
const searchContainer = document.querySelector('.search-container');
const sidebarOverlay = document.getElementById('sidebar-overlay');
// Tab contents are selected dynamically in the switchTab function

// Show/hide sidebar (mobile)
function toggleSidebar() {
    // For mobile devices
    if (window.innerWidth <= 991) {
        sidebar.classList.toggle('mobile-active');
        sidebarOverlay.classList.toggle('active');
        document.body.classList.toggle('sidebar-open');
    } else {
        // For desktop (old behavior)
        sidebar.classList.toggle('collapsed');
        mainContent.classList.toggle('expanded');
    }
}

// Toggle mobile search
function toggleMobileSearch() {
    searchContainer.classList.toggle('mobile-expanded');
}

// Close sidebar when clicking outside
function closeSidebar() {
    sidebar.classList.remove('mobile-active');
    sidebarOverlay.classList.remove('active');
    document.body.classList.remove('sidebar-open');
}

// Switch between pages
function showPage(pageId) {
    // Hide all content sections
    contentSections.forEach(section => {
        section.classList.add('hidden');
    });
    
    // Show selected content section
    const selectedContent = document.getElementById(`${pageId}-content`);
    if (selectedContent) {
        selectedContent.classList.remove('hidden');
    }
    
    // Update active nav link
    navLinks.forEach(link => {
        link.parentElement.classList.remove('active');
        
        if (link.getAttribute('href') === `#${pageId}`) {
            link.parentElement.classList.add('active');
        }
    });
    
    // Initialize specific page content if needed
    if (pageId === 'reservations' && window.BrasserieBotReservations) {
        window.BrasserieBotReservations.init();
    }
}

// Switch between tabs within a page
function switchTab(tabId, tabGroupId) {
    // Get tabs in the same group
    const tabs = document.querySelectorAll(`#${tabGroupId} .tab`);
    const tabContents = document.querySelectorAll(`#${tabGroupId} .tab-content`);
    
    // Hide all tab contents
    tabContents.forEach(content => {
        content.classList.remove('active');
    });
    
    // Remove active class from all tabs
    tabs.forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Show selected tab content
    const selectedContent = document.getElementById(`${tabId}-content`);
    if (selectedContent) {
        selectedContent.classList.add('active');
    }
    
    // Add active class to selected tab
    const selectedTab = document.querySelector(`[data-tab="${tabId}"]`);
    if (selectedTab) {
        selectedTab.classList.add('active');
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Initialize Lucide icons
    lucide.createIcons();
    
    // Setup event listeners for nav links
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const pageId = link.getAttribute('href').substring(1);
            showPage(pageId);
        });
    });
    
    // Setup event listeners for tabs
    tabButtons.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabId = tab.getAttribute('data-tab');
            const tabGroupId = tab.closest('.tabs').parentElement.id;
            switchTab(tabId, tabGroupId);
        });
    });
    
    // Setup default page
    const hash = window.location.hash.substring(1);
    if (hash && document.getElementById(`${hash}-content`)) {
        showPage(hash);
    }
    
    // Setup mobile menu toggle
    if (menuToggle) {
        menuToggle.addEventListener('click', toggleSidebar);
    }
    
    // Setup mobile search toggle
    if (searchToggle) {
        searchToggle.addEventListener('click', toggleMobileSearch);
    }
    
    // Setup sidebar overlay click handler
    if (sidebarOverlay) {
        sidebarOverlay.addEventListener('click', closeSidebar);
    }
    
    // Add mobile-specific behavior for nav links
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            // Close sidebar on mobile when navigating
            if (window.innerWidth <= 991) {
                closeSidebar();
            }
        });
    });
    
    // Handle window resize
    window.addEventListener('resize', () => {
        if (window.innerWidth > 991) {
            // Close mobile sidebar and reset when returning to desktop
            sidebar.classList.remove('mobile-active');
            sidebarOverlay.classList.remove('active');
            document.body.classList.remove('sidebar-open');
            searchContainer.classList.remove('mobile-expanded');
        }
    });
    
    // Setup reservations module if it exists
    if (window.BrasserieBotReservations) {
        // Will be initialized when the reservations page is shown
    }
});

// Make functions available globally
window.showPage = showPage;
window.switchTab = switchTab;
window.toggleSidebar = toggleSidebar;
window.toggleMobileSearch = toggleMobileSearch;
window.closeSidebar = closeSidebar;
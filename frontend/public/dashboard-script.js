// Dashboard functionality
document.addEventListener('DOMContentLoaded', function() {
  // Get all menu items
  const menuItems = document.querySelectorAll('.menu-item');
  
  // Get all pages
  const pages = document.querySelectorAll('.page');
  
  // Add click event to menu items
  menuItems.forEach(item => {
    item.addEventListener('click', function() {
      // Get the page id from data attribute
      const pageId = this.getAttribute('data-page');
      
      // Remove active class from all menu items
      menuItems.forEach(menuItem => {
        menuItem.classList.remove('active');
      });
      
      // Add active class to clicked menu item
      this.classList.add('active');
      
      // Hide all pages
      pages.forEach(page => {
        page.classList.remove('active');
      });
      
      // Show the selected page
      document.getElementById(pageId).classList.add('active');
      
      // Update page title
      const menuText = this.textContent.trim();
      document.title = `BrasserieBot - ${menuText}`;
    });
  });
  
  // Add click event to tabs
  const tabs = document.querySelectorAll('.tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', function() {
      // Get all tabs in the same tab group
      const tabGroup = this.parentElement.querySelectorAll('.tab');
      
      // Remove active class from all tabs in the group
      tabGroup.forEach(t => {
        t.classList.remove('active');
      });
      
      // Add active class to clicked tab
      this.classList.add('active');
    });
  });
  
  // Add click event to room layout options
  const roomLayouts = document.querySelectorAll('.room-layout-option');
  roomLayouts.forEach(layout => {
    layout.addEventListener('click', function() {
      // Remove selected class from all layout options
      roomLayouts.forEach(l => {
        l.classList.remove('selected');
      });
      
      // Add selected class to clicked layout option
      this.classList.add('selected');
    });
  });
});
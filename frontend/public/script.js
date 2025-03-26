// Initialize Lucide icons
document.addEventListener('DOMContentLoaded', () => {
  // Initialize Lucide icons
  lucide.createIcons();

  // Show active page and hide others
  function showPage(pageId) {
    console.log(`Showing page: ${pageId}`);
    
    // Hide all content pages
    document.querySelectorAll('.content').forEach(content => {
      content.classList.add('hidden');
    });
    
    // Show the selected page
    const selectedPage = document.getElementById(`${pageId}-content`);
    if (selectedPage) {
      selectedPage.classList.remove('hidden');
    } else {
      console.warn(`Page content not found for: ${pageId}`);
    }
    
    // Update active state in sidebar
    document.querySelectorAll('.sidebar-nav li').forEach(item => {
      item.classList.remove('active');
    });
    
    // Find the sidebar item with matching href and set it as active
    document.querySelectorAll('.sidebar-nav a').forEach(link => {
      const href = link.getAttribute('href');
      const linkPageId = href.substring(1); // Remove the # from href
      if (linkPageId === pageId) {
        link.parentElement.classList.add('active');
      }
    });
  }

  // Add click event listeners to sidebar links
  document.querySelectorAll('.sidebar-nav a').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const pageId = link.getAttribute('href').substring(1); // Remove the # from href
      showPage(pageId);
    });
  });

  // Add click event listeners to quick action buttons
  document.querySelectorAll('.quick-action-btn').forEach(button => {
    button.addEventListener('click', () => {
      // Extract the page ID from the onclick attribute
      const onclickAttr = button.getAttribute('onclick');
      if (onclickAttr) {
        const match = onclickAttr.match(/showPage\('(.+)'\)/);
        if (match && match[1]) {
          showPage(match[1]);
        }
      }
    });
  });

  // Tab functionality
  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
      // Get the tab group and content group
      const tabGroup = tab.parentElement;
      const tabContentId = tab.getAttribute('data-tab');
      
      // Remove active class from all tabs in the group
      tabGroup.querySelectorAll('.tab').forEach(t => {
        t.classList.remove('active');
      });
      
      // Add active class to clicked tab
      tab.classList.add('active');
      
      // Hide all tab contents in the parent card
      const card = tabGroup.closest('.card');
      if (card) {
        card.querySelectorAll('.tab-content').forEach(content => {
          content.classList.remove('active');
        });
        
        // Show the selected tab content
        const selectedContent = card.querySelector(`#${tabContentId}-content`);
        if (selectedContent) {
          selectedContent.classList.add('active');
        }
      }
    });
  });

  // Execute prompt button functionality
  const executePromptBtn = document.getElementById('execute-prompt-btn');
  if (executePromptBtn) {
    executePromptBtn.addEventListener('click', () => {
      const promptResult = document.getElementById('prompt-result');
      if (promptResult) {
        // Clear placeholder text
        promptResult.innerHTML = '';
        
        // Show loading indicator
        const loadingIndicator = document.createElement('div');
        loadingIndicator.className = 'loading-indicator';
        loadingIndicator.textContent = 'Verwerken van prompt...';
        promptResult.appendChild(loadingIndicator);
        
        // Simulate API call with timeout
        setTimeout(() => {
          // Remove loading indicator
          promptResult.removeChild(loadingIndicator);
          
          // Add result content
          const resultContent = document.createElement('div');
          resultContent.innerHTML = `
            <h4>Analyse van Feature Request</h4>
            <p>Bedankt voor uw feature request. Hier is mijn analyse:</p>
            
            <h5>Verduidelijkende vragen:</h5>
            <ol>
              <li>Wat is de verwachte impact op bestaande gebruikers?</li>
              <li>Zijn er specifieke integraties nodig met externe systemen?</li>
              <li>Wat is de gewenste tijdlijn voor implementatie?</li>
            </ol>
            
            <h5>Ontwikkelplan:</h5>
            <ol>
              <li>Fase 1: Vereistenanalyse en ontwerp (2-3 dagen)</li>
              <li>Fase 2: Backend implementatie (3-5 dagen)</li>
              <li>Fase 3: Frontend ontwikkeling (4-6 dagen)</li>
              <li>Fase 4: Testen en kwaliteitscontrole (2-3 dagen)</li>
              <li>Fase 5: Implementatie en documentatie (1-2 dagen)</li>
            </ol>
            
            <p>Totale geschatte ontwikkeltijd: 12-19 dagen afhankelijk van complexiteit en beschikbaarheid van resources.</p>
          `;
          promptResult.appendChild(resultContent);
        }, 2000);
      }
    });
  }

  // Show dashboard page by default
  showPage('dashboard');
});
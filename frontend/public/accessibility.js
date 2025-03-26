// Toegankelijkheidsverbeteringen voor BrasserieBot Dashboard

document.addEventListener('DOMContentLoaded', () => {
    // Fix voor knoppen zonder toegankelijke labels
    fixButtonAccessibility();
    
    // Fix voor formulierelementen zonder labels
    fixFormAccessibility();
});

/**
 * Voegt aria-labels toe aan alle knoppen zonder toegankelijke tekst
 */
function fixButtonAccessibility() {
    // Icoon knoppen met specifieke klassen
    const buttonSelectors = {
        '.icon-btn.primary i[data-lucide="edit"]': 'Bewerken',
        '.icon-btn.danger i[data-lucide="trash-2"]': 'Verwijderen',
        '.icon-btn.primary i[data-lucide="play"]': 'Afspelen',
        '.icon-btn i[data-lucide="play"]': 'Afspelen',
        '.icon-btn i[data-lucide="filter"]': 'Filteren',
        '.icon-btn i[data-lucide="save"]': 'Opslaan',
        '.icon-btn i[data-lucide="download"]': 'Downloaden',
        '.icon-btn i[data-lucide="upload"]': 'Uploaden',
        '.icon-btn i[data-lucide="plus"]': 'Toevoegen',
        '.icon-btn i[data-lucide="minus"]': 'Verwijderen',
        '.icon-btn i[data-lucide="settings"]': 'Instellingen',
        '.search-toggle i[data-lucide="search"]': 'Zoeken'
    };
    
    // Loop door alle selectors en voeg aria-labels toe
    for (const [selector, label] of Object.entries(buttonSelectors)) {
        document.querySelectorAll(selector).forEach(icon => {
            const button = icon.closest('button');
            if (button && !button.hasAttribute('aria-label')) {
                button.setAttribute('aria-label', label);
            }
        });
    }
    
    // Fix standaard icon-only knoppen die niet worden gedekt door bovenstaande selectors
    document.querySelectorAll('button:not([aria-label])').forEach(button => {
        // Als de knop geen toegankelijke tekst heeft (alleen een icoon)
        if (!button.textContent.trim() && button.querySelector('i[data-lucide]')) {
            const icon = button.querySelector('i[data-lucide]');
            const iconName = icon.getAttribute('data-lucide');
            // Genereer een label op basis van icoon naam
            const label = iconName
                .replace(/-/g, ' ')
                .replace(/\b\w/g, l => l.toUpperCase());
            button.setAttribute('aria-label', label);
        }
    });
}

/**
 * Verbetert toegankelijkheid van formulierelementen
 */
function fixFormAccessibility() {
    // Fix select elementen zonder toegankelijke naam
    document.querySelectorAll('select:not([aria-label]):not([title])').forEach(select => {
        // Probeer een label te vinden dat verbonden is met dit select element
        const id = select.getAttribute('id');
        if (id) {
            const label = document.querySelector(`label[for="${id}"]`);
            if (label) {
                // Als er een label is, gebruiken we dat als toegankelijke naam
                select.setAttribute('aria-label', label.textContent.trim());
            } else {
                // Anders gebruiken we een gegenereerde naam
                select.setAttribute('aria-label', 'Selecteer een optie');
            }
        } else {
            // Als er geen id is, gebruiken we een generieke naam
            select.setAttribute('aria-label', 'Selecteer een optie');
        }
    });
    
    // Fix input[file] elementen zonder toegankelijke naam
    document.querySelectorAll('input[type="file"]:not([aria-label]):not([title])').forEach(input => {
        input.setAttribute('aria-label', 'Bestand uploaden');
        
        // Als er geen placeholder is, voegen we die toe
        if (!input.hasAttribute('placeholder')) {
            input.setAttribute('placeholder', 'Selecteer een bestand...');
        }
    });
    
    // Verbeter andere input velden zonder labels
    document.querySelectorAll('input:not([aria-label]):not([title]):not([placeholder])').forEach(input => {
        // Controleer of er een label voor dit input element is
        const id = input.getAttribute('id');
        if (!id) {
            // Als er geen id is, kunnen we geen label vinden
            // Voeg een generieke aria-label toe
            const type = input.getAttribute('type') || 'text';
            input.setAttribute('aria-label', `Voer ${type} in`);
        }
    });
}
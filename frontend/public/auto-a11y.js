/**
 * BrasserieBot Auto Accessibility
 *
 * Dit script voegt automatisch toegankelijkheidsattributen toe aan elementen
 * om te voldoen aan WCAG-richtlijnen. Het verbetert de toegankelijkheid van
 * de hele site zonder dat elk element handmatig moet worden aangepast.
 */

(function() {
    console.log('Auto Accessibility script geladen');

    // DOM volledige geladen
    document.addEventListener('DOMContentLoaded', function() {
        // Fix alle knoppen zonder toegankelijke tekst
        fixButtonAccessibility();
        
        // Fix alle formulierelementen zonder labels
        fixFormAccessibility();
        
        // Fix alle afbeeldingen zonder alt-text
        fixImageAccessibility();
        
        // Fix alle links zonder toegankelijke tekst
        fixLinkAccessibility();
        
        console.log('Auto Accessibility toegepast');
    });
    
    // Fix knoppen
    function fixButtonAccessibility() {
        // Alle knoppen met een icon maar zonder tekst of title
        const buttons = document.querySelectorAll('button:not([title]), button:not([aria-label])');
        
        buttons.forEach(button => {
            // Als knop al een title of aria-label heeft, niet aanpassen
            if (button.hasAttribute('title') || button.hasAttribute('aria-label')) {
                return;
            }
            
            // Als de knop al toegankelijke tekst heeft, negeren
            if (button.textContent.trim()) {
                return;
            }
            
            // Controleer op icon knoppen
            const icon = button.querySelector('[data-lucide]');
            if (icon) {
                const iconName = icon.getAttribute('data-lucide');
                if (iconName) {
                    const readableName = iconName
                        .replace(/-/g, ' ')
                        .replace(/\b\w/g, l => l.toUpperCase());
                    
                    button.setAttribute('aria-label', readableName);
                    button.setAttribute('title', readableName);
                }
            }
            
            // Speciale gevallen op basis van klasse
            if (button.classList.contains('icon-btn')) {
                if (button.classList.contains('primary')) {
                    const editIcon = button.querySelector('[data-lucide="edit"]');
                    if (editIcon) {
                        button.setAttribute('aria-label', 'Bewerken');
                        button.setAttribute('title', 'Bewerken');
                    }
                }
                
                if (button.classList.contains('danger')) {
                    const trashIcon = button.querySelector('[data-lucide="trash-2"]');
                    if (trashIcon) {
                        button.setAttribute('aria-label', 'Verwijderen');
                        button.setAttribute('title', 'Verwijderen');
                    }
                }
            }
        });
    }
    
    // Fix formulierelementen
    function fixFormAccessibility() {
        // Alle select elementen zonder toegankelijke naam
        const selects = document.querySelectorAll('select:not([title]):not([aria-label])');
        selects.forEach(select => {
            // Zoek een label dat verwijst naar dit element
            const id = select.getAttribute('id');
            if (id) {
                const label = document.querySelector(`label[for="${id}"]`);
                if (label) {
                    select.setAttribute('aria-label', label.textContent.trim());
                    return;
                }
            }
            
            // Als er geen label is, gebruik een generieke naam
            select.setAttribute('aria-label', 'Selecteer een optie');
            select.setAttribute('title', 'Selecteer een optie');
        });
        
        // Alle bestandsinputs zonder toegankelijke naam
        const fileInputs = document.querySelectorAll('input[type="file"]:not([title]):not([aria-label])');
        fileInputs.forEach(input => {
            input.setAttribute('aria-label', 'Bestand uploaden');
            input.setAttribute('title', 'Bestand uploaden');
        });
        
        // Andere inputvelden
        const inputs = document.querySelectorAll('input:not([type="file"]):not([type="checkbox"]):not([type="radio"]):not([title]):not([aria-label]):not([placeholder])');
        inputs.forEach(input => {
            const id = input.getAttribute('id');
            if (id) {
                const label = document.querySelector(`label[for="${id}"]`);
                if (label) {
                    input.setAttribute('aria-label', label.textContent.trim());
                    return;
                }
            }
            
            // Als er geen label is, gebruik een generieke naam op basis van type
            const type = input.getAttribute('type') || 'text';
            input.setAttribute('aria-label', `Voer ${type} in`);
            input.setAttribute('title', `Voer ${type} in`);
        });
    }
    
    // Fix afbeeldingen
    function fixImageAccessibility() {
        const images = document.querySelectorAll('img:not([alt])');
        images.forEach(img => {
            // Probeer een betekenisvolle alt-tekst te vinden
            let altText = '';
            
            // Zoek op basis van src
            const src = img.getAttribute('src');
            if (src) {
                const filename = src.split('/').pop().split('.')[0];
                altText = filename
                    .replace(/[-_]/g, ' ')
                    .replace(/\b\w/g, l => l.toUpperCase());
            }
            
            img.setAttribute('alt', altText || 'Afbeelding');
        });
    }
    
    // Fix links
    function fixLinkAccessibility() {
        const links = document.querySelectorAll('a:not([title])');
        links.forEach(link => {
            // Als link al toegankelijke tekst heeft, negeren
            if (link.textContent.trim()) {
                return;
            }
            
            // Zoek een afbeelding in de link
            const img = link.querySelector('img');
            if (img && img.getAttribute('alt')) {
                link.setAttribute('title', img.getAttribute('alt'));
                return;
            }
            
            // Zoek een icon in de link
            const icon = link.querySelector('[data-lucide]');
            if (icon) {
                const iconName = icon.getAttribute('data-lucide');
                if (iconName) {
                    const readableName = iconName
                        .replace(/-/g, ' ')
                        .replace(/\b\w/g, l => l.toUpperCase());
                    
                    link.setAttribute('title', readableName);
                    link.setAttribute('aria-label', readableName);
                }
                return;
            }
            
            // Als er geen tekst is, gebruik de href
            const href = link.getAttribute('href');
            if (href && !href.startsWith('#') && !href.startsWith('javascript:')) {
                link.setAttribute('title', href);
            }
        });
    }
})();
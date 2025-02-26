// DOM Elements
document.addEventListener('DOMContentLoaded', () => {
    const wordInput = document.getElementById('word-input');
    const generateBtn = document.getElementById('generate-btn');
    const refreshBtn = document.getElementById('refresh-palette-btn');
    const exportBtn = document.getElementById('export-btn');
    const copyAllBtn = document.getElementById('copy-all-btn');
    const colorCards = document.querySelector('.color-cards');
    const previewContainer = document.querySelector('.preview-container');
    const notification = document.querySelector('.notification');
    const fontInfo = document.querySelector('.font-info');
    const aboutLink = document.getElementById('about-link');
    const aboutModal = document.getElementById('about-modal');
    const exportModal = document.getElementById('export-modal');
    const copyCssBtn = document.getElementById('copy-css-btn');
    const cssExportCode = document.getElementById('css-export-code');
    
    // Current state
    let currentWord = '';
    let currentColors = {};
    let currentFonts = {};
    let seedOffset = 0;
    
    // Color palette generation
    function generatePalette(word, offset = 0) {
        if (!word) {
            showNotification('Please enter a word first', 'error');
            return;
        }
        
        currentWord = word;
        seedOffset = offset;
        
        // Convert word to a seed for consistent color generation
        const seed = hashString(word.toLowerCase());
        
        // Generate colors based on the word
        currentColors = {
            background: generateColor(seed, 0 + offset, [95, 100], [10, 20], [80, 95]),
            text: generateColor(seed, 1 + offset, [15, 25], [10, 20], [15, 25]),
            accent: generateColor(seed, 2 + offset, [30, 60], [60, 90], [50, 80]),
            accentText: '#ffffff' // Usually white for contrast
        };
        
        // Update CSS variables
        document.documentElement.style.setProperty('--background', currentColors.background);
        document.documentElement.style.setProperty('--text', currentColors.text);
        document.documentElement.style.setProperty('--accent', currentColors.accent);
        document.documentElement.style.setProperty('--accent-text', currentColors.accentText);
        
        // Generate font pairings based on the word's character
        currentFonts = generateFontPair(word, offset);
        document.documentElement.style.setProperty('--heading-font', `'${currentFonts.heading}', serif`);
        document.documentElement.style.setProperty('--body-font', `'${currentFonts.body}', sans-serif`);
        
        // Update color cards
        updateColorCards(currentColors);
        
        // Update font information
        updateFontInfo(currentFonts);
        
        // Update preview
        updatePreview(word, currentColors, currentFonts);
        
        // Update export CSS code
        updateExportCss(currentColors, currentFonts);
        
        // Show success notification
        showNotification('Color palette generated successfully!');
    }
    
    // Update color cards with generated colors
    function updateColorCards(colors) {
        colorCards.innerHTML = '';
        
        const colorData = [
            { name: 'Background', color: colors.background, role: 'Primary background color' },
            { name: 'Text', color: colors.text, role: 'Main text color' },
            { name: 'Accent', color: colors.accent, role: 'Buttons, links, highlights' },
            { name: 'Accent Text', color: colors.accentText, role: 'Text on accent backgrounds' }
        ];
        
        colorData.forEach(item => {
            const card = document.createElement('div');
            card.className = 'color-card';
            card.innerHTML = `
                <div class="color-preview" style="background-color: ${item.color}"></div>
                <div class="color-info">
                    <div>
                        <div class="color-label">${item.name}</div>
                        <div class="color-hex">${item.color}</div>
                        <div class="color-role">${item.role}</div>
                    </div>
                    <button class="copy-btn" data-color="${item.color}">
                        <i class="fas fa-copy"></i>
                    </button>
                </div>
            `;
            colorCards.appendChild(card);
            
            // Add click event for copy button
            const copyBtn = card.querySelector('.copy-btn');
            copyBtn.addEventListener('click', () => {
                copyToClipboard(item.color);
                showNotification(`Copied ${item.color} to clipboard!`);
            });
        });
    }
    
    // Update font information
    function updateFontInfo(fonts) {
        fontInfo.innerHTML = `
            <div class="font-pair">
                <div class="font-label">Heading Font</div>
                <div id="heading-font" class="font-name">${fonts.heading}</div>
                <button class="copy-btn" data-font="${fonts.heading}">
                    <i class="fas fa-copy"></i>
                </button>
            </div>
            <div class="font-pair">
                <div class="font-label">Body Font</div>
                <div id="body-font" class="font-name">${fonts.body}</div>
                <button class="copy-btn" data-font="${fonts.body}">
                    <i class="fas fa-copy"></i>
                </button>
            </div>
        `;
        
        // Add click events for copy buttons
        const copyBtns = fontInfo.querySelectorAll('.copy-btn');
        copyBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const font = btn.getAttribute('data-font');
                copyToClipboard(font);
                showNotification(`Copied ${font} to clipboard!`);
            });
        });
    }
    
    // Update preview section
    function updatePreview(word, colors, fonts) {
        // Capitalize first letter of word
        const capitalizedWord = word.charAt(0).toUpperCase() + word.slice(1);
        
        previewContainer.innerHTML = `
            <div class="preview-header">
                <h3 class="preview-heading">${capitalizedWord} Design</h3>
                <div class="preview-nav">
                    <a href="#" class="preview-nav-item active">Home</a>
                    <a href="#" class="preview-nav-item">About</a>
                    <a href="#" class="preview-nav-item">Services</a>
                    <a href="#" class="preview-nav-item">Contact</a>
                </div>
            </div>
            <div class="preview-content">
                <h2 class="preview-subheading">Welcome to ${capitalizedWord}</h2>
                <p class="preview-text">
                    This is a preview of how your color palette would look in a real website.
                    The colors and fonts are generated based on the word "${word}".
                </p>
                <button class="preview-button">Learn More</button>
                
                <div class="preview-card">
                    <h4 class="preview-card-title">Did you know?</h4>
                    <p class="preview-card-text">
                        Colors can significantly impact user perception and behavior on websites.
                        The right color palette can improve readability, user engagement, and conversion rates.
                    </p>
                </div>
            </div>
        `;
    }
    
    // Update export CSS code
    function updateExportCss(colors, fonts) {
        cssExportCode.textContent = `
:root {
  --background: ${colors.background};
  --text: ${colors.text};
  --accent: ${colors.accent};
  --accent-text: ${colors.accentText};
  --heading-font: '${fonts.heading}', serif;
  --body-font: '${fonts.body}', sans-serif;
}`;
    }
    
    // Show notification
    function showNotification(message, type = 'success') {
        notification.textContent = message;
        notification.className = 'notification';
        
        if (type === 'error') {
            notification.style.backgroundColor = '#f44336';
        } else {
            notification.style.backgroundColor = '#4caf50';
        }
        
        notification.classList.add('show');
        
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }
    
    // Copy to clipboard
    function copyToClipboard(text) {
        navigator.clipboard.writeText(text).catch(err => {
            console.error('Could not copy text: ', err);
        });
    }
    
    // Copy all colors to clipboard
    function copyAllColors() {
        if (!currentColors.background) {
            showNotification('Generate a palette first', 'error');
            return;
        }
        
        const cssText = `
/* ${currentWord.toUpperCase()} COLOR PALETTE */
--background: ${currentColors.background};
--text: ${currentColors.text};
--accent: ${currentColors.accent};
--accent-text: ${currentColors.accentText};
--heading-font: '${currentFonts.heading}', serif;
--body-font: '${currentFonts.body}', sans-serif;`;
        
        copyToClipboard(cssText);
        showNotification('All colors copied to clipboard!');
    }
    
    // Generate color based on word seed
    function generateColor(seed, offset, hRange, sRange, lRange) {
        // Use the seed and offset to generate a consistent but different value for each color
        const hash = (seed + offset * 100) % 360;
        
        // Map the hash to the specified ranges
        const h = mapRange(hash, 0, 360, hRange[0], hRange[1]);
        const s = mapRange((hash * 1.5) % 100, 0, 100, sRange[0], sRange[1]);
        const l = mapRange((hash * 2.5) % 100, 0, 100, lRange[0], lRange[1]);
        
        return hslToHex(h, s, l);
    }
    
    // Map a value from one range to another
    function mapRange(value, inMin, inMax, outMin, outMax) {
        return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
    }
    
    // Convert HSL to Hex
    function hslToHex(h, s, l) {
        l /= 100;
        const a = s * Math.min(l, 1 - l) / 100;
        const f = n => {
            const k = (n + h / 30) % 12;
            const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
            return Math.round(255 * color).toString(16).padStart(2, '0');
        };
        return `#${f(0)}${f(8)}${f(4)}`;
    }
    
    // Hash a string to a number
    function hashString(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return Math.abs(hash);
    }
    
    // Generate font pair based on word
    function generateFontPair(word, offset = 0) {
        // List of curated font pairs
        const fontPairs = [
            { heading: 'Playfair Display', body: 'Source Sans Pro' },
            { heading: 'Montserrat', body: 'Merriweather' },
            { heading: 'Roboto Slab', body: 'Roboto' },
            { heading: 'Lora', body: 'Open Sans' },
            { heading: 'Oswald', body: 'Quattrocento' },
            { heading: 'Raleway', body: 'Lato' },
            { heading: 'Abril Fatface', body: 'Poppins' },
            { heading: 'Cinzel', body: 'Fauna One' },
            { heading: 'Fjalla One', body: 'Libre Baskerville' },
            { heading: 'Arvo', body: 'Lato' }
        ];
        
        // Use the word to select a consistent font pair
        const index = (hashString(word) + offset) % fontPairs.length;
        return fontPairs[index];
    }
    
    // Toggle modal
    function toggleModal(modal) {
        modal.classList.toggle('show');
    }
    
    // Event listeners
    generateBtn.addEventListener('click', () => {
        generatePalette(wordInput.value.trim());
    });
    
    wordInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            generatePalette(wordInput.value.trim());
        }
    });
    
    refreshBtn.addEventListener('click', () => {
        if (!currentWord) {
            showNotification('Generate a palette first', 'error');
            return;
        }
        seedOffset += 1;
        generatePalette(currentWord, seedOffset);
    });
    
    exportBtn.addEventListener('click', () => {
        if (!currentWord) {
            showNotification('Generate a palette first', 'error');
            return;
        }
        toggleModal(exportModal);
    });
    
    copyAllBtn.addEventListener('click', copyAllColors);
    
    copyCssBtn.addEventListener('click', () => {
        copyToClipboard(cssExportCode.textContent);
        showNotification('CSS copied to clipboard!');
    });
    
    aboutLink.addEventListener('click', (e) => {
        e.preventDefault();
        toggleModal(aboutModal);
    });
    
    // Close modals
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.modal').forEach(modal => {
                modal.classList.remove('show');
            });
        });
    });
    
    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        document.querySelectorAll('.modal').forEach(modal => {
            if (e.target === modal) {
                modal.classList.remove('show');
            }
        });
    });
    
    // Generate a default palette
    generatePalette('chromaword');
}); 
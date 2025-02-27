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
        
        // Show loading state
        showLoadingState(true);
        
        // Use setTimeout to allow the UI to update before heavy computation
        setTimeout(() => {
            try {
                // Convert word to a seed for consistent color generation
                const seed = hashString(word.toLowerCase());
                
                // Get the word's "mood" to influence color selection
                const wordMood = getWordMood(word.toLowerCase());
                
                // Generate colors based on the word
                currentColors = generateColorPalette(seed, offset, wordMood);
                
                // Ensure text has enough contrast with background
                currentColors.text = ensureContrast(currentColors.background, currentColors.text, 4.5);
                
                // Ensure accent has enough contrast with background
                currentColors.accent = ensureContrast(currentColors.background, currentColors.accent, 3);
                
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
                
                // Hide loading state
                showLoadingState(false);
            } catch (error) {
                console.error('Error generating palette:', error);
                showNotification('Error generating palette. Please try again.', 'error');
                showLoadingState(false);
            }
        }, 50);
    }
    
    // Generate a complete color palette
    function generateColorPalette(seed, offset, mood) {
        // Create 5 distinct base hues from the seed
        const baseHue = (seed % 360);
        
        // Apply different color schemes based on mood and seed
        let scheme = (seed % 5); // 0-4 different color schemes
        
        // Adjust scheme based on mood
        if (mood.happy) scheme = 0; // Bright, vibrant
        if (mood.calm) scheme = 1;  // Soft, pastel
        if (mood.serious) scheme = 2; // Professional, muted
        if (mood.energetic) scheme = 3; // High contrast
        if (mood.natural) scheme = 4; // Earth tones
        
        // Apply offset to allow refreshing
        scheme = (scheme + offset) % 5;
        
        let colors = {};
        
        switch(scheme) {
            case 0: // Bright, vibrant
                colors = {
                    background: generateColor(seed, 0 + offset, [baseHue, (baseHue + 5) % 360], [5, 10], [95, 98]),
                    text: generateColor(seed, 1 + offset, [(baseHue + 180) % 360, (baseHue + 190) % 360], [10, 20], [15, 25]),
                    accent: generateColor(seed, 2 + offset, [(baseHue + 120) % 360, (baseHue + 150) % 360], [70, 90], [50, 60]),
                    accentText: '#ffffff'
                };
                break;
            case 1: // Soft, pastel
                colors = {
                    background: generateColor(seed, 0 + offset, [baseHue, (baseHue + 10) % 360], [10, 20], [90, 95]),
                    text: generateColor(seed, 1 + offset, [(baseHue + 180) % 360, (baseHue + 200) % 360], [20, 30], [20, 30]),
                    accent: generateColor(seed, 2 + offset, [(baseHue + 60) % 360, (baseHue + 90) % 360], [40, 60], [60, 75]),
                    accentText: '#ffffff'
                };
                break;
            case 2: // Professional, muted
                colors = {
                    background: generateColor(seed, 0 + offset, [(baseHue + 15) % 360, (baseHue + 30) % 360], [5, 15], [95, 100]),
                    text: generateColor(seed, 1 + offset, [(baseHue + 210) % 360, (baseHue + 230) % 360], [15, 30], [15, 25]),
                    accent: generateColor(seed, 2 + offset, [(baseHue + 200) % 360, (baseHue + 220) % 360], [30, 50], [40, 55]),
                    accentText: '#ffffff'
                };
                break;
            case 3: // High contrast
                colors = {
                    background: generateColor(seed, 0 + offset, [(baseHue + 180) % 360, (baseHue + 200) % 360], [5, 15], [95, 100]),
                    text: generateColor(seed, 1 + offset, [baseHue, (baseHue + 20) % 360], [50, 70], [20, 30]),
                    accent: generateColor(seed, 2 + offset, [(baseHue + 90) % 360, (baseHue + 120) % 360], [80, 100], [45, 55]),
                    accentText: '#ffffff'
                };
                break;
            case 4: // Earth tones
                // Adjust hue to be in earth tone range (20-60 or 180-240)
                const earthHue = (seed % 2 === 0) ? 
                    mapRange(seed % 40, 0, 40, 20, 60) : 
                    mapRange(seed % 60, 0, 60, 180, 240);
                
                colors = {
                    background: generateColor(earthHue, 0 + offset, [earthHue, earthHue + 10], [10, 20], [92, 98]),
                    text: generateColor(earthHue, 1 + offset, [earthHue, earthHue + 10], [30, 50], [20, 30]),
                    accent: generateColor(earthHue, 2 + offset, [earthHue + 15, earthHue + 30], [40, 60], [40, 60]),
                    accentText: '#ffffff'
                };
                break;
        }
        
        return colors;
    }
    
    // Analyze word to determine "mood" for color selection
    function getWordMood(word) {
        const mood = {
            happy: false,
            calm: false,
            serious: false,
            energetic: false,
            natural: false
        };
        
        // Happy words
        const happyWords = ['happy', 'joy', 'bright', 'sunny', 'fun', 'smile', 'laugh', 'cheer'];
        
        // Calm words
        const calmWords = ['calm', 'peace', 'quiet', 'gentle', 'soft', 'serene', 'tranquil', 'relax'];
        
        // Serious words
        const seriousWords = ['serious', 'business', 'professional', 'formal', 'corporate', 'work', 'office'];
        
        // Energetic words
        const energeticWords = ['energy', 'power', 'strong', 'vibrant', 'dynamic', 'active', 'bold'];
        
        // Natural words
        const naturalWords = ['nature', 'earth', 'organic', 'forest', 'ocean', 'mountain', 'garden', 'plant'];
        
        // Check if word contains any mood words
        happyWords.forEach(happyWord => {
            if (word.includes(happyWord)) mood.happy = true;
        });
        
        calmWords.forEach(calmWord => {
            if (word.includes(calmWord)) mood.calm = true;
        });
        
        seriousWords.forEach(seriousWord => {
            if (word.includes(seriousWord)) mood.serious = true;
        });
        
        energeticWords.forEach(energeticWord => {
            if (word.includes(energeticWord)) mood.energetic = true;
        });
        
        naturalWords.forEach(naturalWord => {
            if (word.includes(naturalWord)) mood.natural = true;
        });
        
        return mood;
    }
    
    // Show loading state
    function showLoadingState(isLoading) {
        if (isLoading) {
            generateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
            generateBtn.disabled = true;
            refreshBtn.disabled = true;
        } else {
            generateBtn.innerHTML = 'Generate Palette';
            generateBtn.disabled = false;
            refreshBtn.disabled = false;
        }
    }
    
    // Ensure contrast between two colors meets WCAG standards
    function ensureContrast(background, foreground, minRatio = 4.5) {
        // Convert hex to RGB
        const bgRgb = hexToRgb(background);
        let fgRgb = hexToRgb(foreground);
        
        // Calculate luminance
        const bgLuminance = calculateLuminance(bgRgb);
        let fgLuminance = calculateLuminance(fgRgb);
        
        // Calculate contrast ratio
        let contrastRatio = (Math.max(bgLuminance, fgLuminance) + 0.05) / 
                           (Math.min(bgLuminance, fgLuminance) + 0.05);
        
        // If contrast is insufficient, adjust the foreground color
        if (contrastRatio < minRatio) {
            // Determine if we need to lighten or darken
            const needsDarkening = bgLuminance > fgLuminance;
            
            if (needsDarkening) {
                // Darken the foreground color
                while (contrastRatio < minRatio && fgRgb.r > 0 && fgRgb.g > 0 && fgRgb.b > 0) {
                    fgRgb.r = Math.max(0, fgRgb.r - 5);
                    fgRgb.g = Math.max(0, fgRgb.g - 5);
                    fgRgb.b = Math.max(0, fgRgb.b - 5);
                    fgLuminance = calculateLuminance(fgRgb);
                    contrastRatio = (Math.max(bgLuminance, fgLuminance) + 0.05) / 
                                   (Math.min(bgLuminance, fgLuminance) + 0.05);
                }
            } else {
                // Lighten the foreground color
                while (contrastRatio < minRatio && fgRgb.r < 255 && fgRgb.g < 255 && fgRgb.b < 255) {
                    fgRgb.r = Math.min(255, fgRgb.r + 5);
                    fgRgb.g = Math.min(255, fgRgb.g + 5);
                    fgRgb.b = Math.min(255, fgRgb.b + 5);
                    fgLuminance = calculateLuminance(fgRgb);
                    contrastRatio = (Math.max(bgLuminance, fgLuminance) + 0.05) / 
                                   (Math.min(bgLuminance, fgLuminance) + 0.05);
                }
            }
            
            // Convert back to hex
            return rgbToHex(fgRgb);
        }
        
        return foreground;
    }
    
    // Convert hex to RGB
    function hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : { r: 0, g: 0, b: 0 };
    }
    
    // Convert RGB to hex
    function rgbToHex(rgb) {
        return `#${((1 << 24) + (rgb.r << 16) + (rgb.g << 8) + rgb.b).toString(16).slice(1)}`;
    }
    
    // Calculate luminance for WCAG contrast
    function calculateLuminance(rgb) {
        const a = [rgb.r, rgb.g, rgb.b].map(v => {
            v /= 255;
            return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
        });
        return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
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
                    <button class="copy-btn" data-color="${item.color}" title="Copy color code">
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
            
            // Add click event for color preview to copy color
            const colorPreview = card.querySelector('.color-preview');
            colorPreview.addEventListener('click', () => {
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
                <button class="copy-btn" data-font="${fonts.heading}" title="Copy font name">
                    <i class="fas fa-copy"></i>
                </button>
            </div>
            <div class="font-pair">
                <div class="font-label">Body Font</div>
                <div id="body-font" class="font-name">${fonts.body}</div>
                <button class="copy-btn" data-font="${fonts.body}" title="Copy font name">
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
        
        // Add click events for font names to copy
        const fontNames = fontInfo.querySelectorAll('.font-name');
        fontNames.forEach(name => {
            name.addEventListener('click', () => {
                const font = name.textContent;
                copyToClipboard(font);
                showNotification(`Copied ${font} to clipboard!`);
            });
            name.style.cursor = 'pointer';
            name.title = 'Click to copy';
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
                    The background, text, and accent colors work together to create a harmonious design.
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
        
        // Add interactivity to preview elements
        const previewNavItems = previewContainer.querySelectorAll('.preview-nav-item');
        previewNavItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                previewNavItems.forEach(navItem => navItem.classList.remove('active'));
                item.classList.add('active');
            });
        });
        
        const previewButton = previewContainer.querySelector('.preview-button');
        previewButton.addEventListener('mousedown', () => {
            previewButton.style.transform = 'translateY(2px)';
            previewButton.style.boxShadow = '0 2px 8px rgba(74, 111, 255, 0.2)';
        });
        
        previewButton.addEventListener('mouseup', () => {
            previewButton.style.transform = '';
            previewButton.style.boxShadow = '';
        });
        
        previewButton.addEventListener('mouseleave', () => {
            previewButton.style.transform = '';
            previewButton.style.boxShadow = '';
        });
    }
    
    // Update export CSS code
    function updateExportCss(colors, fonts) {
        cssExportCode.textContent = `
:root {
  /* ${currentWord.toUpperCase()} COLOR PALETTE */
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
            
            // Fallback method
            const textarea = document.createElement('textarea');
            textarea.value = text;
            textarea.style.position = 'fixed';
            document.body.appendChild(textarea);
            textarea.select();
            
            try {
                document.execCommand('copy');
                showNotification(`Copied ${text} to clipboard!`);
            } catch (err) {
                console.error('Fallback copy failed:', err);
                showNotification('Failed to copy to clipboard', 'error');
            }
            
            document.body.removeChild(textarea);
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
        const hash = (seed * (offset + 1) * 11) % 360;
        
        // Map the hash to the specified ranges
        const h = mapRange(hash, 0, 360, hRange[0], hRange[1]);
        const s = mapRange((hash * 2.7 + offset * 13) % 100, 0, 100, sRange[0], sRange[1]);
        const l = mapRange((hash * 3.5 + offset * 17) % 100, 0, 100, lRange[0], lRange[1]);
        
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
        
        // Use a better string hashing algorithm for more variety
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
            
            // Add more variation based on character position
            hash = hash ^ (char * (i + 1));
        }
        
        // Add variation based on string length
        hash = hash ^ (str.length * 719);
        
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
        
        // Prevent body scrolling when modal is open
        if (modal.classList.contains('show')) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
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
                document.body.style.overflow = '';
            });
        });
    });
    
    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        document.querySelectorAll('.modal').forEach(modal => {
            if (e.target === modal) {
                modal.classList.remove('show');
                document.body.style.overflow = '';
            }
        });
    });
    
    // Handle keyboard events
    window.addEventListener('keydown', (e) => {
        // Close modal on Escape key
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal').forEach(modal => {
                if (modal.classList.contains('show')) {
                    modal.classList.remove('show');
                    document.body.style.overflow = '';
                }
            });
        }
    });
    
    // Generate a default palette
    generatePalette('chromaword');
}); 
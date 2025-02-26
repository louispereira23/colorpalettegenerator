# Chromaword: Word-Based Color Palette Generator

Chromaword is a simple yet powerful web application that generates harmonious color palettes for web design based on words. Simply enter a word, and the application will create a cohesive set of colors suitable for web design, including:

- Background color
- Text color
- Accent color
- Accent text color

Additionally, the application suggests font pairings that complement the generated color palette.

## Features

- **Word-Based Color Generation**: Generate unique color palettes based on any word
- **Semantic Color Mapping**: Colors are algorithmically generated to match the "feel" of the input word
- **Font Pairing Suggestions**: Get complementary font pairs for your design
- **Live Preview**: See how your palette looks in a real website layout
- **Copy to Clipboard**: Easily copy color codes and font names
- **Responsive Design**: Works on desktop and mobile devices

## How It Works

Chromaword uses a deterministic algorithm to convert words into color palettes:

1. The word is hashed to create a consistent seed value
2. The seed is used to generate HSL color values within carefully selected ranges for each color role
3. Font pairings are selected from a curated list based on the word's character
4. The preview is updated to show how the colors and fonts work together in a real design

## Usage

1. Enter a word in the input field
2. Click "Generate Palette" or press Enter
3. View the generated color palette and font pairing
4. Use the preview section to see how the colors work together
5. Click the copy button next to any color or font to copy it to your clipboard

## Technologies Used

- HTML5
- CSS3 (with CSS Variables)
- Vanilla JavaScript
- Google Fonts

## Getting Started

To run this project locally:

1. Clone this repository
2. Open `index.html` in your web browser
3. Start generating color palettes!

No build process or dependencies required.

## License

This project is open source and available under the [MIT License](LICENSE).

## Credits

Created by [Your Name]

Font icons provided by [Font Awesome](https://fontawesome.com/) 
const https = require('https');
const fs = require('fs');
const path = require('path');

const fontsDir = path.join(__dirname, '..', 'public', 'fonts');

if (!fs.existsSync(fontsDir)) {
  fs.mkdirSync(fontsDir, { recursive: true });
}

// Google Fonts CSS API to get correct font file URLs
const fontFamilies = [
  { name: 'Montserrat', weights: [300, 400, 500, 600, 700] },
  { name: 'Inter', weights: [300, 400, 500, 600, 700] },
  { name: 'Lato', weights: [300, 400, 700, 900] }, // Lato only has 300, 400, 700, 900
  { name: 'Nunito', weights: [300, 400, 500, 600, 700] },
  { name: 'Oswald', weights: [300, 400, 500, 600, 700] },
  { name: 'Playfair Display', weights: [300, 400, 500, 600, 700] },
  { name: 'Poppins', weights: [300, 400, 500, 600, 700] },
  { name: 'Raleway', weights: [300, 400, 500, 600, 700] },
  { name: 'Roboto', weights: [300, 400, 500, 600, 700] },
  { name: 'Space Grotesk', weights: [300, 400, 500, 600, 700] },
  { name: 'DM Sans', weights: [300, 400, 500, 600, 700] },
];

function getCSSUrl(fontFamily, weights) {
  const weightsStr = weights.join(';');
  return `https://fonts.googleapis.com/css2?family=${fontFamily.replace(/\s/g, '+')}:wght@${weightsStr}&display=swap`;
}

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

function extractFontUrls(css) {
  const urls = [];
  const regex = /url\((https:\/\/fonts\.gstatic\.com\/[^)]+)\)/g;
  let match;
  while ((match = regex.exec(css)) !== null) {
    urls.push(match[1]);
  }
  return urls;
}

async function downloadFonts() {
  console.log('Downloading fonts...');
  
  for (const font of fontFamilies) {
    const fontName = font.name.toLowerCase().replace(/\s/g, '-');
    console.log(`Downloading ${font.name}...`);
    
    const cssUrl = getCSSUrl(font.name, font.weights);
    
    try {
      const cssContent = await new Promise((resolve, reject) => {
        https.get(cssUrl, (res) => {
          let data = '';
          res.on('data', chunk => data += chunk);
          res.on('end', () => resolve(data));
        }).on('error', reject);
      });
      
      const fontUrls = extractFontUrls(cssContent);
      
      for (let i = 0; i < fontUrls.length && i < font.weights.length; i++) {
        const weight = font.weights[i];
        const filename = `${fontName}-${weight}.woff2`;
        const dest = path.join(fontsDir, filename);
        
        try {
          await downloadFile(fontUrls[i], dest);
          console.log(`  ✓ ${filename}`);
        } catch (err) {
          console.error(`  ✗ Failed to download ${filename}:`, err.message);
        }
      }
    } catch (err) {
      console.error(`  ✗ Failed to download ${font.name}:`, err.message);
    }
  }
  
  console.log('Font download complete!');
}

downloadFonts().catch(console.error);

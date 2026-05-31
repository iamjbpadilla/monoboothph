import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');

const ACCENT_COLOR = '#9C27B0';
const BACKGROUND_COLOR = '#F3E5F5'; // Light purple background for icons

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

// Android icon sizes
const androidSizes = [
  { size: 48, folder: 'mipmap-mdpi' },
  { size: 72, folder: 'mipmap-hdpi' },
  { size: 96, folder: 'mipmap-xhdpi' },
  { size: 144, folder: 'mipmap-xxhdpi' },
  { size: 192, folder: 'mipmap-xxxhdpi' },
];

// Web icon sizes
const webSizes = [
  { size: 16, name: 'favicon-16x16.png' },
  { size: 32, name: 'favicon-32x32.png' },
  { size: 48, name: 'favicon-48x48.png' },
  { size: 180, name: 'apple-touch-icon.png' },
  { size: 192, name: 'icon-192x192.png' },
  { size: 512, name: 'icon-512x512.png' },
];

// iOS icon sizes
const iosSizes = [
  { size: 60, name: 'AppIcon-60@2x.png' },
  { size: 60, name: 'AppIcon-60@3x.png', scale: 3 },
  { size: 76, name: 'AppIcon-76@2x.png' },
  { size: 76, name: 'AppIcon-76@3x.png', scale: 3 },
  { size: 120, name: 'AppIcon-120.png' },
  { size: 152, name: 'AppIcon-152.png' },
  { size: 167, name: 'AppIcon-167.png' },
  { size: 180, name: 'AppIcon-180.png' },
];

async function generateIcon(inputPath, outputPath, size, backgroundColor = null, padding = 0) {
  let pipeline = sharp(inputPath);
  
  if (backgroundColor) {
    const bgRgb = hexToRgb(backgroundColor);
    const paddingPx = Math.floor(size * padding);
    const innerSize = size - (paddingPx * 2);
    
    pipeline = pipeline
      .resize(innerSize, innerSize, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .extend({
        top: paddingPx,
        bottom: paddingPx,
        left: paddingPx,
        right: paddingPx,
        background: bgRgb
      });
  } else {
    const paddingPx = Math.floor(size * padding);
    const innerSize = size - (paddingPx * 2);
    
    pipeline = pipeline
      .resize(innerSize, innerSize, { fit: 'contain' })
      .extend({
        top: paddingPx,
        bottom: paddingPx,
        left: paddingPx,
        right: paddingPx,
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      });
  }
  
  await pipeline.png().toFile(outputPath);
  console.log(`Generated: ${outputPath}`);
}

async function generateAndroidIcons() {
  const svgPath = path.join(projectRoot, 'mono-logo.svg');
  const androidResPath = path.join(projectRoot, 'android', 'app', 'src', 'main', 'res');
  
  console.log('Generating Android icons...');
  
  // Generate standard PNG icons
  for (const { size, folder } of androidSizes) {
    const folderPath = path.join(androidResPath, folder);
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }
    
    await generateIcon(
      svgPath,
      path.join(folderPath, 'ic_launcher.png'),
      size,
      BACKGROUND_COLOR,
      0.15
    );
    
    await generateIcon(
      svgPath,
      path.join(folderPath, 'ic_launcher_round.png'),
      size,
      BACKGROUND_COLOR,
      0.15
    );
  }
  
  // Generate adaptive icon foreground (108x108 with safe zone)
  const adaptivePath = path.join(androidResPath, 'mipmap-anydpi-v26');
  if (!fs.existsSync(adaptivePath)) {
    fs.mkdirSync(adaptivePath, { recursive: true });
  }
  
  // Generate adaptive icon foreground as PNG at 108x108 with 10% padding for safe zone
  await generateIcon(
    svgPath,
    path.join(androidResPath, 'drawable', 'ic_launcher_foreground.png'),
    108,
    null,
    0.10
  );
  
  // Also generate foreground PNGs for each density folder with 10% padding
  for (const { size, folder } of androidSizes) {
    const folderPath = path.join(androidResPath, folder);
    await generateIcon(
      svgPath,
      path.join(folderPath, 'ic_launcher_foreground.png'),
      size,
      null,
      0.10
    );
  }
  
  console.log('Android icons generated successfully.');
}

async function generateWebIcons() {
  const svgPath = path.join(projectRoot, 'mono-logo.svg');
  const publicPath = path.join(projectRoot, 'public');
  
  console.log('Generating web icons...');
  
  for (const { size, name } of webSizes) {
    await generateIcon(
      svgPath,
      path.join(publicPath, name),
      size,
      BACKGROUND_COLOR,
      0.15
    );
  }
  
  // Copy SVG as favicon
  fs.copyFileSync(svgPath, path.join(publicPath, 'favicon.svg'));
  console.log('Generated: favicon.svg');
  
  console.log('Web icons generated successfully.');
}

async function generateIOSIcons() {
  const svgPath = path.join(projectRoot, 'mono-logo.svg');
  const iosAssetsPath = path.join(projectRoot, 'ios', 'App', 'App', 'Assets.xcassets', 'AppIcon.appiconset');
  
  console.log('Generating iOS icons...');
  
  if (!fs.existsSync(iosAssetsPath)) {
    fs.mkdirSync(iosAssetsPath, { recursive: true });
  }
  
  for (const { size, name, scale = 1 } of iosSizes) {
    const actualSize = size * scale;
    await generateIcon(
      svgPath,
      path.join(iosAssetsPath, name),
      actualSize,
      BACKGROUND_COLOR,
      0.15
    );
  }
  
  console.log('iOS icons generated successfully.');
}

async function main() {
  try {
    await generateAndroidIcons();
    await generateWebIcons();
    await generateIOSIcons();
    console.log('\nAll icons generated successfully!');
  } catch (error) {
    console.error('Error generating icons:', error);
    process.exit(1);
  }
}

main();

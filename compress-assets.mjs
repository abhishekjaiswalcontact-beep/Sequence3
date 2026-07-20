import sharp from 'sharp';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { stat, rename } from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const publicDir = join(__dirname, 'public');

async function getFileSize(path) {
  const s = await stat(path);
  return (s.size / 1024).toFixed(2) + ' KB';
}

async function compressPng(relativeSrc, relativeDest, resizeOptions = null) {
  const srcPath = join(publicDir, relativeSrc);
  const destPath = join(publicDir, relativeDest);
  const tempPath = destPath + '.tmp.png';

  try {
    const sizeBefore = await getFileSize(srcPath);
    let pipeline = sharp(srcPath);
    
    if (resizeOptions) {
      pipeline = pipeline.resize(resizeOptions);
    }

    await pipeline
      .png({
        quality: 80,
        compressionLevel: 9,
        effort: 8
      })
      .toFile(tempPath);

    await rename(tempPath, destPath);
    const sizeAfter = await getFileSize(destPath);
    console.log(`Compressed ${relativeSrc} -> ${relativeDest}: ${sizeBefore} -> ${sizeAfter}`);
  } catch (err) {
    console.error(`Error compressing ${relativeSrc}:`, err.message);
  }
}

async function run() {
  console.log('Compacting static PNG assets...');
  
  // logo0.png - Used in header/footer, resize if too large
  // It's currently 1.2MB. We resize it to max-width 240px since it's only displayed at small sizes (h-14 or w-auto)
  await compressPng('logo0.png', 'logo0.png', { width: 240, fit: 'inside' });

  // logo1.png - Used as metadata icon / OG image. We make it 512x512 max
  await compressPng('logo1.png', 'logo1.png', { width: 512, height: 512, fit: 'inside' });

  // chatbot.png - Chatbot avatar, 128x128 max
  await compressPng('chatbot.png', 'chatbot.png', { width: 128, height: 128, fit: 'inside' });

  // Showcase images - workout1.png and trainer1.png
  await compressPng('showcase/workout1.png', 'showcase/workout1.png', { width: 800, fit: 'inside' });
  await compressPng('showcase/trainer1.png', 'showcase/trainer1.png', { width: 800, fit: 'inside' });

  // footer_bg.png and footer_blog_thumb.png if they exist
  await compressPng('footer_bg.png', 'footer_bg.png', { width: 800, fit: 'inside' });
  await compressPng('footer_blog_thumb.png', 'footer_blog_thumb.png', { width: 400, fit: 'inside' });

  console.log('Static PNG compression complete!');
}

run().catch(console.error);

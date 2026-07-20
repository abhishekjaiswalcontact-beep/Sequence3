/**
 * Hero Frame Compression Script
 * Converts 196 PNG frames to WebP at 85% quality
 * Estimated: ~200MB PNG → ~20-25MB WebP
 * 
 * Run: node compress-frames.mjs
 */

import sharp from 'sharp';
import { readdir, rename } from 'fs/promises';
import { join, basename, extname } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const sequenceDir = join(__dirname, 'public', 'sequence');

async function compressFrames() {
  const files = await readdir(sequenceDir);
  const pngFiles = files.filter(f => f.endsWith('.png') && f.startsWith('frame_'));
  
  console.log(`Found ${pngFiles.length} PNG frames to compress...`);
  
  let compressed = 0;
  let totalOriginal = 0;
  let totalCompressed = 0;

  const BATCH_SIZE = 8; // Process 8 at a time to avoid memory exhaustion on low-RAM machines

  for (let i = 0; i < pngFiles.length; i += BATCH_SIZE) {
    const batch = pngFiles.slice(i, i + BATCH_SIZE);
    
    await Promise.all(batch.map(async (file) => {
      const inputPath = join(sequenceDir, file);
      const nameWithoutExt = basename(file, extname(file));
      const outputPath = join(sequenceDir, `${nameWithoutExt}.webp`);
      
      try {
        const inputStats = await sharp(inputPath).metadata();
        
        await sharp(inputPath)
          .webp({ 
            quality: 82,        // High quality, much smaller file
            effort: 4,          // Balance speed/size (0-6)
            smartSubsample: true,
            reductionEffort: 4,
          })
          .toFile(outputPath);
        
        compressed++;
        
        if (compressed % 20 === 0 || compressed === pngFiles.length) {
          process.stdout.write(`\r  Progress: ${compressed}/${pngFiles.length} frames`);
        }
      } catch (err) {
        console.error(`\nError compressing ${file}:`, err.message);
      }
    }));
  }
  
  console.log(`\n\n✅ Compression complete!`);
  console.log(`   ${compressed} frames converted to WebP`);
  console.log(`\n   Original frames are still present — delete them manually if desired`);
  console.log(`   e.g.: find public/sequence -name "*.png" -delete`);
}

compressFrames().catch(console.error);

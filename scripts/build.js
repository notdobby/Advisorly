import { copyFileSync, mkdirSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

// Ensure public files are copied to dist
function copyPublicFiles() {
  const publicDir = 'public';
  const distDir = 'dist';
  
  try {
    // Create dist directory if it doesn't exist
    mkdirSync(distDir, { recursive: true });
    
    // Copy all files from public to dist
    const files = readdirSync(publicDir);
    
    files.forEach(file => {
      const sourcePath = join(publicDir, file);
      const destPath = join(distDir, file);
      
      if (statSync(sourcePath).isFile()) {
        copyFileSync(sourcePath, destPath);
        console.log(`Copied: ${file}`);
      }
    });
    
    console.log('✅ Public files copied successfully');
  } catch (error) {
    console.error('❌ Error copying public files:', error);
  }
}

copyPublicFiles(); 
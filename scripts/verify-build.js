import { readdirSync, accessSync, constants } from 'fs';
import { join } from 'path';

function verifyBuild() {
  const distDir = 'dist';
  const requiredFiles = [
    'manifest.json',
    'sw.js',
    'icon-192x192.png',
    'icon-512x512.png',
    'index.html'
  ];
  
  console.log('🔍 Verifying build output...');
  
  try {
    const files = readdirSync(distDir);
    console.log('📁 Files in dist directory:', files);
    
    let allFilesPresent = true;
    
    requiredFiles.forEach(file => {
      const filePath = join(distDir, file);
      try {
        accessSync(filePath, constants.F_OK);
        console.log(`✅ ${file} - Found`);
      } catch (error) {
        console.log(`❌ ${file} - Missing`);
        allFilesPresent = false;
      }
    });
    
    if (allFilesPresent) {
      console.log('🎉 All required files are present!');
    } else {
      console.log('⚠️  Some required files are missing!');
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Error verifying build:', error);
    process.exit(1);
  }
}

verifyBuild(); 
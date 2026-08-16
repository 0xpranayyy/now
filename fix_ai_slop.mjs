import fs from 'fs';
import path from 'path';

const searchDir = './src';

function walkSync(dir, callback) {
  const files = fs.readdirSync(dir);
  files.forEach((file) => {
    const filepath = path.join(dir, file);
    const stats = fs.statSync(filepath);
    if (stats.isDirectory()) {
      walkSync(filepath, callback);
    } else if (stats.isFile() && filepath.endsWith('.tsx')) {
      callback(filepath);
    }
  });
}

let modifiedFiles = 0;

walkSync(searchDir, (filepath) => {
  let content = fs.readFileSync(filepath, 'utf8');
  let original = content;

  // 1. Remove neon glows: shadow-[0_0_20px_rgba(...)]
  content = content.replace(/\bshadow-\[0_[^\]]+\]/g, 'shadow-sm');
  content = content.replace(/\bshadow-\[0_4px_[^\]]+\]/g, 'shadow-sm');

  // 2. Remove background blur blobs
  // Find divs that are just decorative blurred background blobs
  content = content.replace(/<div className="absolute[^>]+blur-(?:3xl|\[100px\])[^>]*>\s*<\/div>/g, '');
  content = content.replace(/<div className="w-32 h-32 bg-brand-500\/20 rounded-full blur-3xl absolute -z-10" \/>/g, '');

  // 3. Remove "glass" from classes if overused (maybe leave some)
  // Let's leave standard glass for navbars, but clean up glowing borders.

  if (content !== original) {
    fs.writeFileSync(filepath, content, 'utf8');
    modifiedFiles++;
    console.log(`Cleaned up: ${filepath}`);
  }
});

console.log(`Done. Cleaned ${modifiedFiles} files.`);

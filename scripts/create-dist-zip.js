import fs from 'fs';
import path from 'path';
import JSZip from 'jszip';

async function zipDirectory(sourceDir, outPath) {
  const zip = new JSZip();

  function addFilesRecursively(currentDir, relativePath = '') {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      const entryRelPath = path.join(relativePath, entry.name).replace(/\\/g, '/');

      if (entry.isDirectory()) {
        addFilesRecursively(fullPath, entryRelPath);
      } else {
        const fileData = fs.readFileSync(fullPath);
        zip.file(entryRelPath, fileData);
      }
    }
  }

  addFilesRecursively(sourceDir);

  const content = await zip.generateAsync({
    type: 'nodebuffer',
    compression: 'DEFLATE',
    compressionOptions: { level: 9 },
  });

  const outDir = path.dirname(outPath);
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  fs.writeFileSync(outPath, content);
  console.log(`Successfully created zip at: ${outPath} (${(content.length / 1024).toFixed(1)} KB)`);
}

async function main() {
  const distDir = path.resolve(process.cwd(), 'dist');
  const publicZip = path.resolve(process.cwd(), 'public', 'dist-digital-desa-pro.zip');
  const rootZip = path.resolve(process.cwd(), 'dist.tar.gz');

  if (!fs.existsSync(distDir)) {
    console.error('dist directory does not exist! Please run npm run build first.');
    process.exit(1);
  }

  await zipDirectory(distDir, publicZip);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});

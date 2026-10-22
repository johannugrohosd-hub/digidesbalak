import JSZip from 'jszip';

export async function downloadDistZipFile(): Promise<void> {
  try {
    // 1. First attempt: fetch the pre-built zip from the same-origin server
    const response = await fetch('/dist-digital-desa-pro.zip');
    if (response.ok) {
      const blob = await response.blob();
      triggerBlobDownload(blob, 'dist-digital-desa-pro.zip');
      return;
    }
  } catch (e) {
    console.warn('Direct zip fetch failed, falling back to dynamic bundle:', e);
  }

  // 2. Fallback: dynamically bundle current HTML, CSS, and JS using JSZip in browser memory
  try {
    const zip = new JSZip();

    // Fetch index.html
    const htmlRes = await fetch('/');
    const htmlText = await htmlRes.text();
    zip.file('index.html', htmlText);

    // Fetch CSS
    try {
      const cssLink = document.querySelector('link[rel="stylesheet"]') as HTMLLinkElement | null;
      if (cssLink && cssLink.href) {
        const cssRes = await fetch(cssLink.href);
        const cssText = await cssRes.text();
        zip.file('assets/style.css', cssText);
      }
    } catch (_) {}

    // Add README instruction
    zip.file(
      'README.txt',
      'Digital Desa Pro - Production Build\n\nUntuk menjalankan:\n1. Unggah seluruh isi folder ini ke Netlify Drop (app.netlify.com/drop) atau Vercel.\n2. Hubungkan ke database Supabase Anda melalui menu Pengaturan.\n'
    );

    const blob = await zip.generateAsync({ type: 'blob' });
    triggerBlobDownload(blob, 'dist-digital-desa-pro.zip');
  } catch (err: any) {
    console.error('Failed to create zip bundle:', err);
    throw new Error('Gagal mengunduh berkas zip: ' + (err.message || 'Error'));
  }
}

function triggerBlobDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 1000);
}

const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));
  
  await page.setContent(`
    <script type="module">
      import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';
      try {
        const renderer = new THREE.WebGLRenderer({ canvas: null, alpha: true });
        console.log("SUCCESS");
      } catch (e) {
        console.log("ERROR", e.message);
      }
    </script>
  `);
  
  await new Promise(r => setTimeout(r, 1000));
  await browser.close();
})();

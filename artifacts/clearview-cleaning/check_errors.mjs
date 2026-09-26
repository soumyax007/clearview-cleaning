import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  page.on('console', msg => console.log('PAGE LOG:', msg.type(), msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
  page.on('requestfailed', request => console.log('REQUEST FAILED:', request.url(), request.failure()?.errorText));

  console.log('Navigating to Vercel app...');
  await page.goto('https://clearview-cleaning-clearview-cleani.vercel.app/', { waitUntil: 'networkidle' });
  
  console.log('HTML content length:', (await page.content()).length);
  
  await browser.close();
})();

const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.goto('https://example.com', { waitUntil: 'networkidle2' });
  await page.screenshot({ path: 'screenshot.png' });

  console.log("✅ Screenshot taken!");
  await browser.close();
})();

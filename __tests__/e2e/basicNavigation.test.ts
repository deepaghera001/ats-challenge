import { launch } from 'puppeteer';

describe('Basic navigation', () => {
  it('should visit homepage', async () => {
    const browser = await launch();
    const page = await browser.newPage();
    
    try {
      await page.goto('http://localhost:9002');
      await page.screenshot({ path: 'homepage-screenshot.png' });
    } finally {
      await browser.close();
    }
  });
});
import { launch } from 'puppeteer';
import path from 'path';

describe('Document upload flow', () => {
  it('should submit job description and CV file', async () => {
    const browser = await launch({ headless: false });
    const page = await browser.newPage();
    
    try {
      await page.goto('http://localhost:9002');

      // Fill job description
      const jdTextarea = await page.waitForSelector('textarea[placeholder="Paste the full job description here..."]');
      await jdTextarea.type('Sample job description with over 50 characters to meet validation requirements');

      // Upload PDF file
      const fileInput = await page.waitForSelector('input[accept=".pdf,.doc,.docx,.txt"]');
      const filePath = path.resolve(__dirname, '../../test-data/resume.pdf');
      console.log(filePath);
      await fileInput.uploadFile(filePath);

      // Submit form
      const submitButton = await page.waitForSelector('button[type="submit"]');
      await submitButton.click();

      // Wait for next stage and verify
      await page.waitForSelector('.animate-spin', { hidden: true, timeout: 30000 });
      await page.screenshot({ path: 'upload-flow-screenshot.png' });

    } finally {
    //   await browser.close();
    }
  });
});
import { launch } from 'puppeteer';
import path from 'path';

describe('Interview Assessment Flow', () => {
  it('should complete the entire interview process', async () => {
    const browser = await launch({ headless: false, defaultViewport: null });
    const page = await browser.newPage();

    try {
      // Navigate to the application
      await page.goto('http://localhost:9002', { waitUntil: 'networkidle2' });

      // Step 1: Document Upload
      await page.waitForSelector('textarea[placeholder^="Paste the full job description"]');
      await page.type(
        'textarea[placeholder^="Paste the full job description"]',
        'We are seeking a skilled software engineer with 5+ years of experience in full-stack development. The ideal candidate should have strong expertise in React, Node.js, and cloud technologies. Must have experience with agile methodologies and team collaboration.'
      );

      // Upload CV file
      const fileInput = await page.waitForSelector('input[type=file][accept]');
      const filePath = path.resolve(__dirname, '../../test-data/resume.pdf');
      await fileInput.uploadFile(filePath);

      // Submit the upload form
      const uploadButton = await page.waitForSelector('button[type=submit]');
      await uploadButton.click();

      // Wait for the Interview stage to load by checking for the card title text
      await page.waitForFunction(
        () => document.body.innerText.includes('Interview in Progress'),
        { timeout: 30000 }
      );

      // Step 2: Answer Interview Questions
      let questionCount = 0;
      while (true) {
        // Detect if we're on the Performance Report stage
        const isReport = await page.evaluate(
          () => document.body.innerText.includes('Performance Report') || document.body.innerText.includes('Performance Evaluation')
        );
        if (isReport) {
          console.log('Reached performance report after', questionCount, 'questions');
          break;
        }

        // Wait for question text container
        const questionEl = await page.waitForSelector('p.bg-muted, .space-y-2 p.bg-muted', { timeout: 10000 });
        const questionText = await questionEl.evaluate(el => el.textContent.trim());
        console.log(`Q${questionCount + 1}:`, questionText);

        // Provide a standard answer
        const answerTextarea = await page.waitForSelector('textarea#candidateAnswer');
        await answerTextarea.click({ clickCount: 3 });
        await answerTextarea.type(
          'I have extensive experience in this area. Throughout my career, I have successfully implemented similar solutions using best practices and modern technologies.'
        );

        // Submit the answer and wait for network
        const submitBtn = await page.waitForSelector('button:enabled');
        await Promise.all([
          page.waitForResponse(resp => resp.ok()),
          submitBtn.click(),
        ]);

        questionCount++;

        // Pause to allow potential follow-up
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Check and answer follow-up if present
        const hasFollowUp = await page.evaluate(
          () => !!document.querySelector('.border-l-2.border-primary')
        );
        if (hasFollowUp) {
          console.log('Handling follow-up question');
          const followTextarea = await page.waitForSelector('textarea#candidateAnswer');
          await followTextarea.click({ clickCount: 3 });
          await followTextarea.type(
            'Let me provide more specific details about my experience in this area, highlighting key projects and outcomes.'
          );

          const followSubmit = await page.waitForSelector('button:enabled');
          await Promise.all([
            page.waitForResponse(resp => resp.ok()),
            followSubmit.click(),
          ]);

          // Brief pause after follow-up
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      // Final screenshot for verification
      await page.screenshot({ path: 'interview-complete.png', fullPage: true });
    } finally {
      await browser.close();
    }
  }, 300000);
});
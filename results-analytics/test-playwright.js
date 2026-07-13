import { chromium } from 'playwright-core';

async function test() {
  console.log('Starting Playwright test...');
  
  let browser;
  try {
    browser = await chromium.launch({
      headless: true,
      executablePath: 'C:\\Users\\UDDESH\\AppData\\Local\\ms-playwright\\chromium-1228\\chrome-win64\\chrome.exe'
    });
    
    console.log('Browser launched');
    
    const page = await browser.newPage();
    
    console.log('Navigating to page...');
    await page.goto('https://jntuhconnect.dhethi.com/academicresult/result?htno=237W1A0501', {
      waitUntil: 'networkidle',
      timeout: 40000
    });
    
    console.log('Page loaded, waiting for content...');
    
    // Wait for student data to appear
    try {
      await page.waitForFunction(
        () => {
          const text = document.body.innerText;
          // Look for actual student data (not just labels)
          return text.includes('AADESH') || text.match(/\d{3}[A-Z]\d[A-Z]\d{4}/);
        },
        { timeout: 10000 }
      );
      console.log('Student data found!');
    } catch (e) {
      console.log('Timeout waiting for student data, but continuing...');
    }
    
    const text = await page.evaluate(() => document.body.innerText);
    console.log('==== PAGE TEXT ====');
    console.log(text);
    console.log('==== Total length: ' + text.length + ' chars ====');
    
    // Look for specific content
    const patterns = {
      'STUDENT NAME': text.includes('STUDENT NAME'),
      'AADESH': text.includes('AADESH'),
      'SGPA': text.includes('SGPA'),
      'Roll Number': text.includes('237W1A0501') || text.match(/\d{3}[A-Z]\d[A-Z]\d{4}/),
      'GPA values': text.match(/\d\.\d{2}/g),
      'Grades': text.match(/[A-F]\+?|O|--/g)
    };
    
    console.log('\n==== Data Found ====');
    Object.entries(patterns).forEach(([key, found]) => {
      console.log((found ? '✓' : '✗') + ' ' + key);
    });
    
    await page.close();
    await browser.close();
  } catch (err) {
    console.error('Error:', err.message);
    console.error('Stack:', err.stack);
    if (browser) await browser.close();
  }
}

test();

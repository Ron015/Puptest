const puppeteer = require("puppeteer");
const path = require("path");

// ✅ Ron's saved data
const data = {
  "#DistrictofResidence": "Yes",
  "#btnSubmit": "Submit",
  "#candidatehasbeenpromoted": "Yes",
  "#ddlAdharCard": "No",
  "#fileCertificate": "41d70784affd6424e44cb9b839c96b75.jpg",
  "#isappeared": "No",
  "#ispassed": "No",
  "#readtheProspectus": "Yes",
  "#studycertificatesigned": "0"
};

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"]
  });

  const page = await browser.newPage();

  // 🌐 Navigate to the form
  await page.goto("https://cbseitms.rcil.gov.in/nvs/Index/OpenRegistrationForm", {
    waitUntil: "networkidle2"
  });

  // 🔔 Handle alert automatically
  page.on('dialog', async dialog => {
    console.log(`🔔 Alert detected: ${dialog.message()}`);
    await dialog.accept();
  });

  for (const selector in data) {
    const value = data[selector];

    try {
      await page.waitForSelector(selector, { timeout: 5000 });
      const inputType = await page.$eval(selector, el => el.type);

      if (inputType === "file") {
        const filePath = path.resolve(__dirname, value);
        const input = await page.$(selector);
        await input.uploadFile(filePath);
        console.log(`📎 Uploaded: ${selector} → ${value}`);
      } else if (inputType === "select-one") {
        await page.select(selector, value);
        console.log(`✅ Selected: ${selector} = ${value}`);
        await page.waitForTimeout(1000); // wait for potential alert/dialog
      } else if (inputType === "radio" || inputType === "checkbox") {
        await page.click(selector);
        console.log(`☑️ Clicked: ${selector}`);
      } else {
        await page.click(selector, { clickCount: 3 });
        await page.type(selector, value.toString());
        console.log(`📝 Filled: ${selector} = ${value}`);
      }
    } catch (err) {
      console.warn(`⚠️ Could not process ${selector}:`, err.message);
    }
  }

  // 📸 Take screenshot after filling
  await page.screenshot({ path: "screenshot.png", fullPage: true });
  console.log("📸 Screenshot saved as filled-form.png");

  // // ✅ Auto-submit
  // try {
    // await page.click("#btnSubmit");
    // console.log("🚀 Form submitted!");
  // } catch (e) {
    // console.log("❌ Failed to auto-submit. Submit manually if needed.");
  // }

  // // 📸 Screenshot after submission
  // await page.waitForTimeout(3000);
  // await page.screenshot({ path: "after-submit.png", fullPage: true });
  // console.log("📸 Screenshot saved as after-submit.png");

  console.log("✅ All fields filled and submitted!");
  await browser.close();
})();

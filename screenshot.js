const puppeteer = require("puppeteer");
const path = require("path");

const data = {
  "#DistrictofResidence": "Yes",
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
  
  // 🧠 Step 1: Go to initial OpenRegistrationForm URL (will auto-redirect)
  await page.goto("https://cbseitms.rcil.gov.in/nvs/Index/OpenRegistrationForm", {
    waitUntil: "networkidle2",
    timeout: 60000
  });
  
  // 📍 Capture final redirected URL
  const finalUrl = page.url();
  console.log("✅ Final redirected form URL:", finalUrl);
  
  // 🔔 Auto-accept alerts (for ddlAdharCard etc)
  page.on("dialog", async dialog => {
    console.log("⚠️ Alert:", dialog.message());
    await dialog.accept();
  });
  
  // 🧩 Step 2: Fill all fields
  for (const selector in data) {
    const value = data[selector];
    
    try {
      await page.waitForSelector(selector, { timeout: 5000 });
      const inputType = await page.$eval(selector, el => el.type);
      
      if (inputType === "file") {
        const filePath = path.resolve(__dirname, value);
        const input = await page.$(selector);
        await input.uploadFile(filePath);
        console.log(`📎 Uploaded: ${selector}`);
      } else if (inputType === "select-one") {
        await page.select(selector, value);
        await page.waitForTimeout(1000);
        console.log(`✅ Selected: ${selector} = ${value}`);
      } else {
        await page.click(selector, { clickCount: 3 });
        await page.type(selector, value.toString());
        console.log(`📝 Filled: ${selector} = ${value}`);
      }
    } catch (err) {
      console.warn(`⚠️ Skipped ${selector}:`, err.message);
    }
  }
  
  // 📸 Screenshot before submit
  await page.screenshot({ path: "filled-form.png", fullPage: true });
  console.log("📸 Screenshot: filled-form.png");
  
  // 🚀 Submit form
  try {
    await page.click("#btnSubmit");
    console.log("🟢 Submitted successfully");
  } catch (err) {
    console.warn("❌ Submit failed:", err.message);
  }
  
  // 📸 Screenshot after submit
  await page.waitForTimeout(3000);
  await page.screenshot({ path: "after-submit.png", fullPage: true });
  console.log("📸 Screenshot: after-submit.png");
  
  await browser.close();
})();
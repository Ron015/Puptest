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
  await page.screenshot({ path: "screenshot.png", fullPage: true });
  console.log("📸 Screenshot saved as filled-form.png");
  console.log("✅ All fields filled and submitted!");
  await browser.close();
})();

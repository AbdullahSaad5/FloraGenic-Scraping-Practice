import e from "cors";
import puppeteer from "puppeteer";

const URL =
  "https://extension.umn.edu/solve-problem/plant-diseases#tree-and-shrub-diseases-1872363";

// The function that initiates the scraping process and returns the data
async function run(disease) {
  let browser;
  try {
    // Launch the browser and create a new page
    browser = await puppeteer.launch({
      headless: false,
    });

    const page = await browser.newPage();
    // Visit the page
    await page.goto(URL);

    page.on("console", (msg) => {
      for (let i = 0; i < msg.args.length; ++i)
        console.log(`${i}: ${msg.args[i]}`);
    });

    // Get the appropriate link and click it
    let linkHandlers = await page.$x(`//a[contains(text(), '${disease}')]`);
    if (linkHandlers.length > 0) {
      await linkHandlers[0].evaluate((elem) => elem.click());
      // Wait for the page to load
      await page.waitForNavigation();
      await page.waitForSelector(".js-quickedit-page-title");

      const getQuickFacts = await page.evaluate(() => {
        const quickFactsTags = document.querySelectorAll(
          ".col-12.col-md-7.col-lg-8.big-column .quick-facts ul li"
        );
        const quickFacts = [];
        quickFactsTags.forEach((tag) => {
          quickFacts.push(tag.innerText);
        });
        return quickFacts;
      });

      const getIdentificationSteps = await page.evaluate(() => {
        const heading = [...document.querySelectorAll("h2")].find((h2) =>
          h2.innerText.includes("How to identify")
        );

        const identificationSteps = [];

        if (heading) {
        }

        return identificationSteps;
      });

      console.log(getQuickFacts);
      console.log(getIdentificationSteps);
    } else {
      throw new Error("Link not found");
    }
  } catch (err) {
    console.error(err);
  } finally {
    await browser?.close();
  }
}

run("Black knot");

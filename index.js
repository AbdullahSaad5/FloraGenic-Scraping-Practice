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

    // Get the appropriate link and click it
    let linkHandlers = await page.$x(`//a[contains(text(), '${disease}')]`);
    if (linkHandlers.length > 0) {
      await linkHandlers[1].evaluate((elem) => elem.click());
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

      // Get the content of the sections and store them in an array
      const sectionNames = ["How to identify", "survive and spread?"];
      const sectionContents = await Promise.all(
        sectionNames.map((sectionName) => getSpecificSection(sectionName, page))
      );

      return [getQuickFacts, ...sectionContents];
    } else {
      throw new Error("Link not found");
    }
  } catch (err) {
    console.error(err);
  } finally {
    await browser?.close();
  }
}

const getSpecificSection = async (sectionName, page) => {
  const sectionContent = await page.evaluate(async (sectionName) => {
    // Find the h2 element with the text "How to identify"
    const header = [...document.querySelectorAll("h2")].find((h2) =>
      h2.innerText.includes(sectionName)
    );

    // Get the next sibling of the header and check if it's a ul element
    // If it's not, check if it's a div element and if it contains a ul element
    // else return null
    let currentNode = header.nextSibling;
    while (currentNode) {
      if (currentNode.tagName === "UL") {
        return currentNode.innerText.split("\n").filter(Boolean);
      } else if (
        currentNode.tagName === "DIV" &&
        currentNode.querySelector("ul")
      ) {
        const ul = currentNode.querySelector("ul");
        return ul.innerText.split("\n").filter(Boolean);
      }
      currentNode = currentNode.nextSibling || currentNode.firstElementChild;
    }

    return [];
  }, sectionName);
  return sectionContent;
};

run("Cedar-apple rust").then((sectionContents) => {
  console.log(sectionContents);
});

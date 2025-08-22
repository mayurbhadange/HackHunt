import puppeteer from "puppeteer";

export async function mlh() {
  let browser;
  const path = '/app/.cache/puppeteer/chrome/linux-131.0.6778.204/chrome-linux64/chrome'

  try {
    browser = await puppeteer.launch({
      headless: "new",
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
        "--disable-software-rasterizer",
        "--no-zygote",
        "--single-process"
      ]
    });

    const page = await browser.newPage();

    page.setDefaultNavigationTimeout(60000);

    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3"
    );

    await page.goto("https://mlh.io/seasons/2025/events", {
      waitUntil: "networkidle0",
      timeout: 1000000,
    });

    await page.waitForSelector(".event", { timeout: 60000 });

    const events = await page.evaluate(() => {
      const eventElements = document.querySelectorAll(".event");
      const currentDate = new Date();

      return Array.from(eventElements)
        .map((element) => {
          try {
            const eventName =
              element.querySelector(".event-name")?.innerText?.trim() || "";
            const eventDate =
              element.querySelector(".event-date")?.innerText?.trim() || "";
            const eventLocation =
              element.querySelector(".event-location")?.innerText?.trim() || "";
            const eventUrl = element.querySelector(".event-link")?.href || "";
            const eventImage =
              element.querySelector(".image-wrap img")?.src || "";
            const eventStartDate =
              element.querySelector('meta[itemprop="startDate"]')?.content ||
              "";
            const eventEndDate =
              element.querySelector('meta[itemprop="endDate"]')?.content || "";

            return {
              name: eventName,
              date: eventDate,
              location: eventLocation,
              url: eventUrl,
              image: eventImage,
              startDate: eventStartDate,
              endDate: eventEndDate,
              startDateTime: new Date(eventStartDate),
            };
          } catch (error) {
            console.error("Error parsing event:", error);
            return null;
          }
        })
        .filter((event) => event && event.startDateTime > currentDate)
        .sort((a, b) => a.startDateTime - b.startDateTime);
    });

    // console.log('Upcoming Events:', events);
    return events;
  } catch (error) {
    console.error("Error fetching hackathons:", error);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// mlh().catch(console.error);

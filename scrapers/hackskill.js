import axios from "axios";
import * as cheerio from 'cheerio';


const url = "https://hack2skill.com/#ongoin-initiatives";

function cleanObjectStrings(obj) {
    const cleanedObject = {};
    for (const key in obj) {
      if (typeof obj[key] === "string") {
        cleanedObject[key] = obj[key].replace(/\s+/g, ' ').trim();
      } else {
        cleanedObject[key] = obj[key];
      }
    }
    return cleanedObject;
  }

  
export async function hackskill() {
  try {
    const response = await axios.get(url);

    const html = response.data;
    const $ = cheerio.load(html);

    const hackathons = [];

    $(".swiper-slide.newCard").each((index, element) => {
      const hackathon = {};

      hackathon.title = $(element).find(".card-body h6").text().trim();
      hackathon.description = $(element)
        .find(".card-body .hack-description")
        .text()
        .trim();
      hackathon.lastDate = $(element)
        .find(".card-body .last-date")
        .text()
        .trim();
      hackathon.fee = $(element).find(".card-body .reg-fee").text().trim();
      hackathon.mode = $(element).find(".card-body .hack-type").text().trim();
      hackathon.link = $(element).find(".card-body a").attr("href");

      hackathons.push(hackathon);
    });

    const cleaned = hackathons.map((hackathon) => cleanObjectStrings(hackathon));

    return cleaned;
  } catch (error) {
    console.error("Error fetching the data:", error);
  }
}

import axios from "axios";
import * as cheerio from "cheerio";

const url = "https://devfolio.co/hackathons";

export async function devfolio() {
  try {
    const response = await axios.get(url);
    const html = response.data;
    const $ = cheerio.load(html);

    let hackathons = [];

    const hackathonCards = $(
      ".CompactHackathonCard__StyledCard-sc-9ff45231-0"
    );

    hackathonCards.each((_, element) => {
      const title = $(element).find("h3").text().trim() || null;
      const theme =
        $(element).find(".sc-hZgfyJ.hZQPen").eq(1).text().trim() || null;

      let participants;
      try {
        participants =
          $(element)
            .find(".sc-hZgfyJ.iYRNEE")
            .text()
            .trim()
            .match(/\d+/)[0] || null;
      } catch (e) {
        participants = null;
      }

      const startDate =
        $(element).find(".sc-hZgfyJ.ifkmYk").eq(2).text().trim() || null;
      const mode =
        $(element).find(".sc-hZgfyJ.ifkmYk").eq(0).text().trim() || null;
      const status =
        $(element).find(".sc-hZgfyJ.ifkmYk").eq(1).text().trim() || null;
      const link = $(element).find("a").attr("href") || null;

      let date;
      
      // console.log(title, startDate);
      try{
        date = new Date(startDate.split(" ")[1]);
      }
      catch(e){
        date = null;
      }

      hackathons.push({
        title,
        theme,
        participants,
        date,
        mode,
        status,
        link,
      });
    });

    const filteredhackathons = hackathons.filter(
      (hackathon) => hackathon.date instanceof Date && !isNaN(hackathon.date)
    );
    return filteredhackathons;
  } catch (error) {
    console.error("Error fetching the page:", error);
    return [];
  }
}

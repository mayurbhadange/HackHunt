import { parse } from "path";
import axios from "axios";
import fs from "fs";

const BASE_URL = "https://devpost.com/api/hackathons";

const PARAMS = {
  "status[]": ["upcoming", "open"],
};

function parseDateRange(dateRange) {
  const [startStr, endStrWithYear] = dateRange.split(" - ");

  const hasYearInStart = startStr.includes(",");

  let startDateStr, endDateStr;
  if (hasYearInStart) {

    startDateStr = startStr.trim();
    // endDateStr = endStrWithYear.trim();
  } else {

    const year = endStrWithYear.split(", ")[1];
    startDateStr = `${startStr}, ${year}`;
    // endDateStr = endStrWithYear.trim();
  }

  const startDate = new Date(startDateStr);
  // const endDate = new Date(endDateStr);

  return startDate;
}

function fetchthemes (themes) {
    const themeArray = [];
    themes.forEach((theme) => {
        themeArray.push(theme.name);
    });
    return themeArray;
}

const fetchHackathons = async (totalPages = 10) => {
  const hackathons = [];

  for (let page = 1; page <= totalPages; page++) {
    try {
    //   console.log(`Fetching data from page ${page}...`);
      const response = await axios.get(BASE_URL, {
        params: { ...PARAMS, page },
      });

      if (response.data && response.data.hackathons) {
        hackathons.push(...response.data.hackathons);
      } else {
        console.log(`No hackathons data on page ${page}.`);
        break;
      }
    } catch (error) {
      console.error(`Failed to fetch data for page ${page}:`, error.message);
      break;
    }
  }

  return hackathons;
};


export const devpost = async () => {
  const allHackathons = await fetchHackathons();

  const hackathons = allHackathons.map((hackathon) => ({
    title: hackathon.title,
    theme: fetchthemes(hackathon.themes),
    startDate: parseDateRange(hackathon.submission_period_dates),
    status: hackathon.open_state,
    mode:
      hackathon.displayed_location.location == "Online" ? "Online" : "Offline",
    location: hackathon.displayed_location.location,
    link: `${hackathon.url}`,
    participants: hackathon.registrations_count,
    organiser: hackathon.organization_name,
    website: "Devpost",
  }));

  return hackathons;


  //   const outputFile = "hackathons_data.json";
  //   fs.writeFileSync(outputFile, JSON.stringify(allHackathons, null, 2), "utf-8");

  //   console.log(`Data saved to ${outputFile}`);
};


// main();

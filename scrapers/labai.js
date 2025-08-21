import axios from "axios";

const url = 'https://lablab.ai/_next/data/uIw4HWS3zzBwP0JpL2umK/event.json';

export async function labai() {
  try {
    const response = await axios.get(url);
    const data = response.data.pageProps.sortedEvents;

    const currentDate = new Date();

    const upcomingEvents = data.filter(event => new Date(event.endAt) > currentDate);

    // upcomingEvents.forEach(event => {
    //   console.log(`Event Name: ${event.name}`);
    //   console.log(`Description: ${event.description}`);
    //   console.log(`Start Date: ${new Date(event.startAt).toLocaleString()}`);
    //   console.log(`End Date: ${new Date(event.endAt).toLocaleString()}`);
    //   console.log(`Participants: ${event._count.participants}`);
    //   console.log('----------------------------------');
    // });
    return upcomingEvents;
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}

// labai();

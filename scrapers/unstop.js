import axios from 'axios';

async function fetchUnstopData(page = 1) {
  try {
    const response = await axios.get('https://unstop.com/api/public/opportunity/search-result', {
      params: {
        opportunity: 'hackathons',
        per_page: 40,
        oppstatus: 'open',
        quickApply: true,
        page: page
      },
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    return formatHackathonData(response.data);
  } catch (error) {
    console.error(`Error fetching page ${page}:`, error.message);
    return [];
  }
}

function formatHackathonData(rawData) {
  if (!rawData.data || !rawData.data.data) return [];

  return rawData.data.data.map(hackathon => {
    const themes = hackathon.filters
      .filter(filter => filter.type !== 'eligible')
      .map(filter => filter.name);

    const startDate = new Date(hackathon.start_date);
    const stringDate = startDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const mode = hackathon.region?.toLowerCase() === 'online' ? 'Online' : 'Offline';
    const location = mode === 'Online' ? 'Online' : (hackathon.jobDetail?.locations?.[0] || 'Not specified');

    return {
      title: hackathon.title || '',
      theme: themes,
      startDate: startDate,
      stringDate: stringDate,
      status: hackathon.status || '',
      mode: mode,
      location: location,
      link: hackathon.seo_url || '',
      participants: hackathon.registerCount || 0,
      organiser: hackathon.organisation?.name || '',
      website: 'Unstop'
    };
  });
}

export async function Unstop() {
  let currentPage = 1;
  let hasMorePages = true;
  const allHackathons = [];

  while (hasMorePages) {
    // console.log(`Fetching page ${currentPage}...`);
    const pageData = await fetchUnstopData(currentPage);
    
    if (!pageData || pageData.length === 0) {
      hasMorePages = false;
      continue;
    }

    allHackathons.push(...pageData);
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    currentPage++;
  }

  return allHackathons;
}

// getAllHackathons()
//   .then(hackathons => {
//     console.log('Total hackathons fetched:', hackathons.length);
//     // console.log('Sample hackathon:', hackathons[0]);
//     console.log(hackathons);
//   })
//   .catch(console.error);

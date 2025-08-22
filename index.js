import mongoose from "mongoose";
mongoose.set('strictQuery', false);
import cron from "node-cron";
import { devfolio } from "./scrapers/devfolio.js";
import { hackskill } from "./scrapers/hackskill.js";
import { labai } from "./scrapers/labai.js";
// import { mlh } from "./scrapers/mlh.js";
import { Unstop } from "./scrapers/unstop.js";
import { devpost } from "./scrapers/devpost.js";
import dotenv from "dotenv";
import express from "express";
import path from 'path';
import { fileURLToPath } from 'url';
import { timeStamp } from "console";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
app.use(express.json());

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_DB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

await connectDB();

// Wait for connection to be ready
await new Promise((resolve) => {
  if (mongoose.connection.readyState === 1) {
    resolve();
  } else {
    mongoose.connection.once('open', resolve);
  }
});

console.log('Database connection established, starting operations...');

const hackathonSchema = new mongoose.Schema({
  title: String,
  theme: Array,
  startDate: Date,
  stringDate: String,
  status: String,
  mode: String,
  location: String,
  link: String,
  participants: Number,
  organiser: String,
  website: String,
  }, {timestamps: true}
);

const Hackathon =
  mongoose.models.Hackathon || mongoose.model("Hackathon", hackathonSchema);

const updateSchema = new mongoose.Schema({
  lastUpdate: {
    type: Date,
    default: Date.now(),
  },
  version: {
    type: Number,
  },
});

export const Update =
  mongoose.models.Update || mongoose.model("Update", updateSchema);

// const devfolioHackathons = devfolio();
// let devfolioHackathons = [];
// devfolioHackathons = await devfolio();
// console.log(devfolioHackathons);

async function fetchDevfolio() {
  try {
    console.log('Starting Devfolio fetch...');
    const hackathons = await devfolio();
    console.log(`Found ${hackathons.length} hackathons from Devfolio`);
    
    // Use Promise.all to handle all updates concurrently
    await Promise.all(hackathons.map(async (hackathon) => {
      try {
        await Hackathon.updateOne(
          {
            title: hackathon.title,
            startDate: hackathon.date,
            link: hackathon.link,
          },
          {
            $setOnInsert: {
              theme: [hackathon.theme],
              stringDate: hackathon.date,
              status: hackathon.status || "Unspecified",
              mode: hackathon.mode || "Unspecified",
              location: hackathon.location || "Unspecified",
              link: hackathon.link,
              participants: hackathon.participants || 0,
              organiser: "Devfolio",
              website: "Devfolio",
            },
          },
          { upsert: true }
        );
      } catch (updateError) {
        console.error(`Error updating Devfolio hackathon ${hackathon.title}:`, updateError.message);
      }
    }));
    
    console.log('Completed Devfolio updates');
    // hackathons.forEach((hackathon) => {
    //   const newHackathon = new Hackathon({
    //     title: hackathon.title,
    //     theme: [hackathon.theme],
    //     startDate: hackathon.date,
    //     stringDate: hackathon.date,
    //     status: hackathon.status || "Unspecified",
    //     mode: hackathon.mode || "Unspecified",
    //     location: hackathon.location || "Unspecified",
    //     link: hackathon.link,
    //     participants: hackathon.participants || 0,
    //     organiser: "Devfolio",
    //     website: "Devfolio",
    //   });
    //   newHackathon.save();

    //   //   console.log({
    //   //     title: hackathon.title,
    //   //     theme: [hackathon.theme],
    //   //     startDate: hackathon.date,
    //   //     stringDate: hackathon.date,
    //   //     status: hackathon.status || "Unspecified",
    //   //     mode: hackathon.mode || "Unspecified",
    //   //     location: hackathon.location || "Unspecified",
    //   //     link: hackathon.link,
    //   //     participants: hackathon.participants || 0,
    //   //     organiser: "Devfolio",
    //   //     website: "Devfolio",
    //   //   });
    // });
    // console.log(filteredhackathons); // Use the hackathons data as needed
  } catch (error) {
    console.error("Error fetching hackathons:", error);
  }
}

// fetchDevfolio();

async function fetchDevpost() {
  try {
    const hackathons = await devpost();
    hackathons.forEach(async (hackathon) => {
      await Hackathon.updateOne(
        {
          title: hackathon.title,
          startDate: hackathon.startDate,
          link: hackathon.link,
        }, // Filter criteria
        {
          $setOnInsert: {
            theme: hackathon.theme,
            stringDate: hackathon.startDate.toString(),
            status: hackathon.status || "Unspecified",
            mode: hackathon.mode || "Unspecified",
            location: hackathon.location || "Unspecified",
            link: hackathon.link,
            participants: hackathon.participants || 0,
            organiser: hackathon.organiser || "Unspecified",
            website: hackathon.website,
          },
        },
        { upsert: true } // Ensures atomic check and insert
      );
    });
    // hackathons.forEach((hackathon) => {
    //   const newHackathon = new Hackathon({
    //     title: hackathon.title,
    //     theme: hackathon.theme,
    //     startDate: hackathon.startDate,
    //     stringDate: hackathon.startDate.toString(),
    //     status: hackathon.status || "Unspecified",
    //     mode: hackathon.mode || "Unspecified",
    //     location: hackathon.location || "Unspecified",
    //     link: hackathon.link,
    //     participants: hackathon.participants || 0,
    //     organiser: hackathon.organiser || "Unspecified",
    //     website: hackathon.website,
    //   });
    //   newHackathon.save();
    //   // console.log({
    //   //     title: hackathon.title,
    //   //     theme: hackathon.theme,
    //   //     startDate: hackathon.startDate,
    //   //     stringDate: hackathon.startDate.toString(),
    //   //     status: hackathon.status || "Unspecified",
    //   //     mode: hackathon.mode || "Unspecified",
    //   //     location: hackathon.location || "Unspecified",
    //   //     link: hackathon.link,
    //   //     participants: hackathon.participants || 0,
    //   //     organiser: hackathon.organiser || "Unspecified",
    //   //     website: hackathon.website,
    //   //   })
    // });
    // console.log(hackathons); // Use the hackathons data as needed
  } catch (error) {
    console.error("Error fetching hackathons:", error);
  }
}

// fetchDevpost();

async function fetchHackskill() {
  try {
    const hackathons = await hackskill();
    // console.log(hackathons);
    const currentDate = new Date();

    // Filter events that are not yet completed
    const upcominghackathons = hackathons.filter(
      (hackathon) => new Date(hackathon.lastDate.split(":")[1]) > currentDate
    );
    upcominghackathons.forEach(async (hackathon) => {
      await Hackathon.updateOne(
        {
          title: hackathon.title,
          startDate: new Date(hackathon.lastDate.split(":")[1]),
          link: hackathon.link,
        }, // Unique filter
        {
          $setOnInsert: {
            theme: ["Unspecified"],
            stringDate: hackathon.lastDate.split(":")[1].trim(),
            status: "Upcoming",
            mode: hackathon.mode.split(":")[1].trim() || "Unspecified",
            location:
              hackathon.mode.split(":")[1] == "Online" ? "Online" : "Offline",
            link: hackathon.link,
            participants: 0,
            organiser: "Hack2skill",
            website: "Hack2skill",
          },
        },
        { upsert: true } // Create if it doesn't exist
      );
    });

    // upcominghackathons.forEach((hackathon) => {
    //   const newHackathon = new Hackathon({
    //     title: hackathon.title,
    //     theme: ["Unspecified"],
    //     startDate: new Date(hackathon.lastDate.split(":")[1]),
    //     stringDate: hackathon.lastDate.split(":")[1].trim(),
    //     status: "Upcoming",
    //     mode: hackathon.mode.split(":")[1].trim() || "Unspecified",
    //     location:
    //       hackathon.mode.split(":")[1] == "Online" ? "Online" : "Offline",
    //     link: hackathon.link,
    //     participants: 0,
    //     organiser: "Hackskill",
    //     website: "Hackskill",
    //   });
    //   newHackathon.save();
    //   // console.log({
    //   //     title: hackathon.title,
    //   //     theme: ["Unspecified"],
    //   //     startDate: new Date(hackathon.lastDate.split(":")[1]),
    //   //     stringDate: hackathon.lastDate.split(":")[1].trim(),
    //   //     status: "Upcoming",
    //   //     mode: hackathon.mode.split(":")[1].trim() || "Unspecified",
    //   //     location: hackathon.mode.split(":")[1] == "Online" ? "Online" : "Offline",
    //   //     link: hackathon.link,
    //   //     participants: 0,
    //   //     organiser: "Hackskill",
    //   //     website: "Hackskill"
    //   // })
    // });
    // console.log(hackathons); // Use the hackathons data as needed
  } catch (error) {
    console.error("Error fetching hackathons:", error);
  }
}

// await fetchHackskill();

async function fetchLabAi() {
  try {
    const hackathons = await labai();
    // hackathons.forEach((hackathon) => {
    //     const newHackathon = new Hackathon({
    //         title: hackathon.name,
    //         theme: ["Unspecified"],
    //         startDate: new Date(hackathon.startAt),
    //         stringDate: hackathon.startAt,
    //         status: "Upcoming",
    //         mode: "Online",
    //         location: "Online",
    //         link: "https://lablab.ai",
    //         participants: hackathon._count.participants,
    //         organiser: "LabAI",
    //         website: "LabAI",
    //       });
    //   //   newHackathon.save();
    // //   console.log({
    // //     title: hackathon.name,
    // //     theme: ["Unspecified"],
    // //     startDate: new Date(hackathon.startAt),
    // //     stringDate: hackathon.startAt,
    // //     status: "Upcoming",
    // //     mode: "Online",
    // //     location: "Online",
    // //     link: "https://lablab.ai",
    // //     participants: hackathon._count.participants,
    // //     organiser: "LabAI",
    // //     website: "LabAI",
    // //   });
    // });
    hackathons.forEach(async (hackathon) => {
      await Hackathon.updateOne(
        {
          title: hackathon.name,
          startDate: new Date(hackathon.startAt),
          link: hackathon.link,
        }, // Unique filter criteria
        {
          $setOnInsert: {
            theme: ["Unspecified"],
            stringDate: hackathon.startAt,
            status: "Upcoming",
            mode: "Online",
            location: "Online",
            link: "https://lablab.ai",
            participants: hackathon._count.participants,
            organiser: "LabAI",
            website: "LabAI",
          },
        },
        { upsert: true } // Insert if not already exists
      );
    });

    // Use the hackathons data as needed
  } catch (error) {
    console.error("Error fetching hackathons:", error);
  }
}

// fetchLabAi();

async function fetchUnstop() {
  try {
    const hackathons = await Unstop();
    // hackathons.forEach((hackathon) => {
    //   // console.log({
    //   //         title: hackathon.title,
    //   //         theme: hackathon.theme,
    //   //         startDate: hackathon.startDate,
    //   //         stringDate: hackathon.stringDate,
    //   //         status: hackathon.status,
    //   //         mode: hackathon.mode,
    //   //         location: hackathon.location,
    //   //         link: hackathon.link,
    //   //         participants: hackathon.participants,
    //   //         organiser: hackathon.organiser,
    //   //         website: hackathon.website,
    //   //     })
    //   const newHackathon = new Hackathon({
    //     title: hackathon.title,
    //     theme: hackathon.theme,
    //     startDate: hackathon.startDate,
    //     stringDate: hackathon.stringDate,
    //     status: hackathon.status,
    //     mode: hackathon.mode,
    //     location: hackathon.location,
    //     link: hackathon.link,
    //     participants: hackathon.participants,
    //     organiser: hackathon.organiser,
    //     website: hackathon.website,
    //   });
    //   newHackathon.save();
    // });
    hackathons.forEach(async (hackathon) => {
      await Hackathon.updateOne(
        {
          title: hackathon.title,
          startDate: hackathon.startDate,
          link: hackathon.link,
        }, // Unique filter criteria
        {
          $setOnInsert: {
            theme: hackathon.theme,
            stringDate: hackathon.stringDate,
            status: hackathon.status,
            mode: hackathon.mode,
            location: hackathon.location,
            link: hackathon.link,
            participants: hackathon.participants,
            organiser: hackathon.organiser,
            website: hackathon.website,
          },
        },
        { upsert: true } // Insert if document does not exist
      );
    });

    // console.log(hackathons); // Use the hackathons data as needed
  } catch (error) {
    console.error("Error fetching hackathons:", error);
  }
}

// fetchUnstop();

const delay = (delayInms) => {
  return new Promise((resolve) => setTimeout(resolve, delayInms));
};

async function main() {
  try {
    console.log("Starting hackathon data collection...");
    
    const fetchFunctions = [
      { name: 'Devfolio', fn: fetchDevfolio },
      { name: 'Devpost', fn: fetchDevpost },
      { name: 'Hackskill', fn: fetchHackskill },
      { name: 'Unstop', fn: fetchUnstop }
      // { name: 'LabAI', fn: fetchLabAi }
    ];

    for (const { name, fn } of fetchFunctions) {
      try {
        console.log(`Fetching ${name}...`);
        await fn();
        await delay(2000); // Reduced delay since we have better error handling
        console.log(`Completed ${name} fetch.`);
      } catch (error) {
        console.error(`Error during ${name} fetch:`, error);
        // Continue with next fetch even if one fails
      }
    }

    console.log("All data collection completed.");
    
    // Clean up duplicates
    console.log("Removing duplicates...");
    await removeduplicatesbytitle();
    await removeduplicatesbylink();
    
    // Update timestamp
    console.log("Updating timestamp...");
    const oldupdate = await Update.findOne();
    await Update.findOneAndUpdate(
      oldupdate ? { _id: oldupdate._id } : {},
      { 
        lastUpdate: Date.now(),
        version: oldupdate ? oldupdate.version + 1 : 1 
      },
      { upsert: true }
    );
    
    console.log("Process completed successfully!");
  } catch (error) {
    console.error("Critical error in main process:", error);
    throw error; // Re-throw to be caught by the top-level error handler
  }
}

// console.log("Running the scraper...");
// // await main();
// // await fetchMLH()
// console.log("Scrapping Done!");
// const oldupdate = await Update.findOne();
// console.log(oldupdate);
// // const newupdate = Update.create({ lastUpdated: new Date(), version: 1 });
// await Update.findByIdAndUpdate(
//   oldupdate._id,
//   { lastUpdate: Date.now(), version: oldupdate.version + 1 },
//   { upsert: true }
// );

const removeduplicatesbytitle = async () => {
  const duplicates = await Hackathon.aggregate([
    // Group by the field you want to check for duplicates
    {
      $group: {
        _id: {
          title: "$title",
          // link: "$link",
        }, // Group by the specified field
        count: { $sum: 1 }, // Count occurrences
        docs: { $push: "$_id" }, // Keep track of document IDs
      },
    },
    // Only keep groups that have more than one document
    {
      $match: {
        count: { $gt: 1 },
      },
    },
  ]);

  // 2. Remove duplicates while keeping one copy
  for (const duplicate of duplicates) {
    // Get all document IDs except the first one (which we'll keep)
    const duplicateIds = duplicate.docs.slice(1);

    // Delete all duplicates
    await Hackathon.deleteMany({
      _id: { $in: duplicateIds },
    });
  }
};

const removeduplicatesbylink = async () => {
  const duplicates = await Hackathon.aggregate([
    // Group by the field you want to check for duplicates
    {
      $group: {
        _id: {
          // title: "$title",
          link: "$link",
        }, // Group by the specified field
        count: { $sum: 1 }, // Count occurrences
        docs: { $push: "$_id" }, // Keep track of document IDs
      },
    },
    // Only keep groups that have more than one document
    {
      $match: {
        count: { $gt: 1 },
      },
    },
  ]);

  // 2. Remove duplicates while keeping one copy
  for (const duplicate of duplicates) {
    // Get all document IDs except the first one (which we'll keep)
    const duplicateIds = duplicate.docs.slice(1);

    // Delete all duplicates
    await Hackathon.deleteMany({
      _id: { $in: duplicateIds },
    });
  }
};

// const keepAlive = () => {
//   const url = 'https://rc-app2.onrender.com/';
//   setInterval(async () => {
//     try {
//       const response = await fetch(url);
//       console.log(
//         'Keep-alive ping sent, status:',
//         response.status
//       );
//     } catch (error) {
//       console.error(
//         'Keep-alive ping failed:',
//         error
//       );
//     }
//   }, 840000); // 14 minutes
// };

// keepAlive();

// console.log("HELLO FROM INDEX.JS");
cron.schedule("0 */6 * * *", async () => {
  console.log("Running the scraper...");
  await main();
  
  console.log("Scrapping Done!");
  const oldupdate = await Update.findOne();
  console.log(oldupdate);
  // const newupdate = Update.create({ lastUpdated: new Date(), version: 1 });
  await Update.findByIdAndUpdate(
    oldupdate._id,
    { lastUpdate: Date.now(), version: oldupdate.version + 1 },
    { upsert: true }
  );
  await removeduplicatesbytitle();
  await removeduplicatesbylink();
});

await main();
// // await fetchMLH()
// console.log("Scrapping Done!");
// const oldupdate = await Update.findOne();
// console.log(oldupdate);
// // const newupdate = Update.create({ lastUpdated: new Date(), version: 1 });
// await Update.findByIdAndUpdate(
//   oldupdate._id,
//   { lastUpdate: Date.now(), version: oldupdate.version + 1 },
//   { upsert: true }
// );
// await removeduplicatesbytitle();
// await removeduplicatesbylink();

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get("/hackathons", async (req, res) => {
    try {
      const hackathons = await Hackathon.find();
      res.json(hackathons);
    } catch (error) {
      console.error("Error fetching hackathons:", error);
      res.status(500).json({ error: "Failed to fetch hackathons" });
    }
  });

app.get("/testdb", async (req, res) => {
  try {
    // Create a dummy hackathon
    const dummyHackathon = new Hackathon({
      title: "Test Hackathon",
      theme: ["Test"],
      startDate: new Date(),
      stringDate: new Date().toLocaleDateString(),
      status: "Upcoming",
      mode: "Online",
      location: "Online",
      link: "https://example.com",
      participants: 0,
      organiser: "Test Organiser",
      website: "Test Website",
    });

    // Save the dummy hackathon to the database
    await dummyHackathon.save();

    // Retrieve the dummy hackathon from the database
    const retrievedHackathon = await Hackathon.findOne({ title: "Test Hackathon" });

    // Send the retrieved hackathon as a JSON response
    res.json(retrievedHackathon);
  } catch (error) {
    console.error("Error testing database:", error);
    res.status(500).json({ error: "Failed to test database" });
  }
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});   
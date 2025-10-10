import app from "./api";
import dotenv from "dotenv";
import db from "./db/connection";
import seed from "./db/seeds/seeds";
import data from "./db/Development-Data/development_Data";

dotenv.config();

const PORT: number = process.env.PORT ? parseInt(process.env.PORT, 10) : 9090;

(async () => {
  try {
    // Check if events table exists
    const result = await db.query(
      "SELECT table_name FROM information_schema.tables WHERE table_name = 'events'"
    );
    if (result.rows.length === 0) {
      console.log("Tables not found, seeding database...");
      await seed(data);
      console.log("Database seeded successfully.");
    } else {
      console.log("Tables already exist, skipping seed.");
    }
  } catch (err) {
    console.error("Error checking or seeding database:", err);
  }

  app.listen(PORT, () => {
    console.log(`Listening on ${PORT}...`);
  });
})();

// app/services/syncCron.js
import cron from "node-cron";
import fetch from "node-fetch";

cron.schedule("0 0 * * *", async () => {
  try {
    const response = await fetch("https://reporting.curacallxrm.net:3000/api/recordings/cronSync", {
      method: "POST",
    });
    const result = await response.json();
    console.log("Cron Sync Result:", result);
  } catch (error) {
    console.error("Error during cron sync:", error);
  }
});

console.log("Cron job scheduled to run at midnight daily.");

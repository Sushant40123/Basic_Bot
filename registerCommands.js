const { REST, Routes } = require("discord.js");
require("dotenv").config();

const CLIENT_ID = "1459080673133465695";

const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    console.log("🧹 Clearing GLOBAL commands...");
    await rest.put(
      Routes.applicationCommands(CLIENT_ID),
      { body: [] }
    );
    console.log("✅ Global commands cleared");
  } catch (err) {
    console.error(err);
  }
})();

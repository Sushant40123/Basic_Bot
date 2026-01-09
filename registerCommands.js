const { REST, Routes, SlashCommandBuilder } = require("discord.js");
require("dotenv").config();

const CLIENT_ID = "1459080673133465695";
const GUILD_ID = "1455244012456906795";

const commands = [
  new SlashCommandBuilder()
    .setName("raid")
    .setDescription("Raid tracker")
    .addSubcommand(sub =>
      sub.setName("now").setDescription("Show current raid")
    )
    .addSubcommand(sub =>
      sub.setName("next").setDescription("Show next raid")
    )
];

const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    console.log("⏳ Registering guild commands...");
    await rest.put(
      Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
      { body: commands }
    );
    console.log("✅ Guild commands registered");
  } catch (err) {
    console.error("❌ Error registering commands:", err);
  }
})();

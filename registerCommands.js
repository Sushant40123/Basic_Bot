const { REST, Routes, SlashCommandBuilder } = require("discord.js");
require("dotenv").config();

const CLIENT_ID = "YOUR_APPLICATION_ID";
const GUILD_ID = "YOUR_SERVER_ID"; // ONLY this server will get commands

const commands = [
  new SlashCommandBuilder()
    .setName("raid")
    .setDescription("Raid tracker")
    .addSubcommand(s =>
      s.setName("now").setDescription("Show current raid")
    )
    .addSubcommand(s =>
      s.setName("next").setDescription("Show next raid")
    )
];

const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    console.log("⏳ Registering GUILD commands...");
    await rest.put(
      Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
      { body: commands }
    );
    console.log("✅ Guild commands registered");
  } catch (err) {
    console.error(err);
  }
})();

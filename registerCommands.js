const { REST, Routes, SlashCommandBuilder } = require("discord.js");
require("dotenv").config();

const CLIENT_ID = "1459080673133465695";

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
    console.log("⏳ Registering GLOBAL commands...");
    await rest.put(
      Routes.applicationCommands(CLIENT_ID),
      { body: commands }
    );
    console.log("✅ Global commands registered");
  } catch (err) {
    console.error(err);
  }
})();

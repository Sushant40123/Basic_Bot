const { REST, Routes, SlashCommandBuilder } = require("discord.js");
require("dotenv").config();

const CLIENT_ID = "1459080673133465695";
const GUILD_ID = "1457038106405503261";

const commands = [
  // /raid
  new SlashCommandBuilder()
    .setName("raid")
    .setDescription("Raid tracker")
    .addSubcommand(s =>
      s.setName("now").setDescription("Show current raid")
    )
    .addSubcommand(s =>
      s.setName("next").setDescription("Show next raid")
    ),

  // /portal
  new SlashCommandBuilder()
    .setName("portal")
    .setDescription("Control portal ping alerts")
    .addSubcommand(s =>
      s.setName("on").setDescription("Enable portal pings")
    )
    .addSubcommand(s =>
      s.setName("off").setDescription("Disable portal pings")
    )
    .addSubcommand(s =>
      s.setName("status").setDescription("Check portal ping status")
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
    console.error(err);
  }
})();

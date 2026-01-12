const { REST, Routes, SlashCommandBuilder } = require("discord.js");
require("dotenv").config();

// 🔧 CHANGE THESE
const CLIENT_ID = "1459080673133465695";
const GUILD_ID = "1457038106405503261";

const commands = [
  // ================= /raid =================
  new SlashCommandBuilder()
    .setName("raid")
    .setDescription("Raid information")
    .addSubcommand(s =>
      s.setName("now")
       .setDescription("Show current raid")
    )
    .addSubcommand(s =>
      s.setName("next")
       .setDescription("Show next raid")
    ),

  // ================= /portal =================
  new SlashCommandBuilder()
    .setName("portal")
    .setDescription("Portal alert controls (owner only)")
    .addSubcommand(s =>
      s.setName("on")
       .setDescription("Enable portal pings")
    )
    .addSubcommand(s =>
      s.setName("off")
       .setDescription("Disable portal pings")
    )
    .addSubcommand(s =>
      s.setName("status")
       .setDescription("Check portal ping status")
    )
    .addSubcommand(s =>
      s.setName("test")
       .setDescription("Send a test portal alert")
       .addStringOption(o =>
         o.setName("raid")
          .setDescription("Which raid to test")
          .setRequired(true)
          .addChoices(
            { name: "Goblin", value: "Goblin" },
            { name: "Subway", value: "Subway" },
            { name: "Infernal", value: "Infernal" },
            { name: "Insect", value: "Insect" },
            { name: "Igris", value: "Igris" },
            { name: "Baruka", value: "Baruka" }
          )
       )
    )
];

const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    console.log("⏳ Registering guild slash commands...");
    await rest.put(
      Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
      { body: commands }
    );
    console.log("✅ Slash commands registered successfully");
  } catch (error) {
    console.error("❌ Error registering commands:", error);
  }
})();

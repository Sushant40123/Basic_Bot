require("dotenv").config();
const { Client, GatewayIntentBits, Events } = require("discord.js");
const { getRaidInfo } = require("./raidLogic");

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

client.once(Events.ClientReady, () => {
  console.log("✅ Bot is online");
});

client.on("interactionCreate", async interaction => {
  if (!interaction.isChatInputCommand()) return;
  if (interaction.commandName !== "raid") return;

  const raid = getRaidInfo();
  const sub = interaction.options.getSubcommand();

  if (sub === "now") {
    if (raid.isActive) {
      await interaction.reply(
        `🔥 **Current Raid:** ${raid.currentRaid}\n⏳ Ends in ${raid.minutesLeft}m ${raid.secondsLeft}s`
      );
    } else {
      await interaction.reply(
        `❌ **No raid active right now**\n➡️ **Next Raid:** ${raid.nextRaid}\n⏳ Starts in ${raid.minutesLeft}m ${raid.secondsLeft}s`
      );
    }
  }

  if (sub === "next") {
    await interaction.reply(
      `➡️ **Next Raid:** ${raid.nextRaid}\n⏳ Starts in ${raid.minutesLeft}m ${raid.secondsLeft}s`
    );
  }
});

client.login(process.env.DISCORD_TOKEN);

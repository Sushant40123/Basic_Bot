require("dotenv").config();
const { Client, GatewayIntentBits, Events } = require("discord.js");
const { getRaidInfo } = require("./raidLogic");

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

// ===== CONFIG FROM ENV =====
const PORTAL_CHANNEL_ID = process.env.PORTAL_CHANNEL_ID;

const RAID_ROLES = {
  Goblin: process.env.ROLE_GOBLIN,
  Subway: process.env.ROLE_SUBWAY,
  Infernal: process.env.ROLE_INFERNAL,
  Insect: process.env.ROLE_INSECT,
  Igris: process.env.ROLE_IGRIS,
  Baruka: process.env.ROLE_BARUKA
};

// ===== READY =====
client.once(Events.ClientReady, () => {
  console.log("✅ Bot is online");
});

// ===== SLASH COMMANDS =====
client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isChatInputCommand()) return;
  if (interaction.commandName !== "raid") return;

  try {
    const raid = getRaidInfo();
    const sub = interaction.options.getSubcommand();

    if (sub === "now") {
      if (raid.isActive) {
        await interaction.reply(
          `🔥 **Current Raid:** ${raid.currentRaid}\n⏳ Ends in ${raid.minutesLeft}m ${raid.secondsLeft}s`
        );
      } else {
        await interaction.reply(
          `❌ **No raid active right now**`
        );
      }
    }

    if (sub === "next") {
      await interaction.reply(
        `➡️ **Next Raid:** ${raid.nextRaid}`
      );
    }

  } catch (err) {
    console.error("Slash command error:", err);

    if (!interaction.replied) {
      await interaction.reply({
        content: "⚠️ Something went wrong. Try again.",
        ephemeral: true
      });
    }
  }
});

// ===== PORTAL ALERT (3 MIN, ONCE PER RAID) =====
let announcedForRaid = null;

setInterval(async () => {
  try {
    const raid = getRaidInfo();

    // Alert exactly once, 3 minutes before raid starts
    if (
      !raid.isActive &&
      raid.minutesLeft === 3 &&
      announcedForRaid !== raid.nextRaid
    ) {
      announcedForRaid = raid.nextRaid;

      const channel = await client.channels.fetch(PORTAL_CHANNEL_ID);
      if (!channel) return;

      const roleId = RAID_ROLES[raid.nextRaid];
      const ping = roleId ? `<@&${roleId}>` : "";

      await channel.send(
        `**Portal:**\n` +
        `current portal starts in **3 mins:**\n

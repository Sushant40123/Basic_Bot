require("dotenv").config();
const { Client, GatewayIntentBits, Events } = require("discord.js");
const { getRaidInfo } = require("./raidLogic");

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

// ================= CONFIG =================

// 🔒 YOUR Discord User ID (ONLY YOU can toggle pings)
const BOT_OWNER_ID = "741686398503092227";

// Channel where portal messages go
const PORTAL_CHANNEL_ID = process.env.PORTAL_CHANNEL_ID;

// Role pings per raid
const RAID_ROLES = {
  Goblin: process.env.ROLE_GOBLIN,
  Subway: process.env.ROLE_SUBWAY,
  Infernal: process.env.ROLE_INFERNAL,
  Insect: process.env.ROLE_INSECT,
  Igris: process.env.ROLE_IGRIS,
  Baruka: process.env.ROLE_BARUKA
};

// Portal pings OFF by default
let portalPingsEnabled = false;

// Prevent duplicate alerts
let announcedForRaid = null;

// ================= READY =================

client.once(Events.ClientReady, () => {
  console.log("✅ Bot is online");
});

// ================= SLASH COMMANDS =================

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  try {
    // -------- /raid --------
    if (interaction.commandName === "raid") {
      const raid = getRaidInfo();
      const sub = interaction.options.getSubcommand();

      if (sub === "now") {
        if (raid.isActive) {
          return interaction.reply(
            `🔥 **Current Raid:** ${raid.currentRaid}\n⏳ Ends in ${raid.minutesLeft}m ${raid.secondsLeft}s`
          );
        } else {
          return interaction.reply("❌ **No raid active right now**");
        }
      }

      if (sub === "next") {
        return interaction.reply(`➡️ **Next Raid:** ${raid.nextRaid}`);
      }
    }

    // -------- /portal (OWNER ONLY) --------
    if (interaction.commandName === "portal") {

      // 🔒 Owner check
      if (interaction.user.id !== BOT_OWNER_ID) {
        return interaction.reply({
          content: "⛔ You are not allowed to use this command.",
          ephemeral: true
        });
      }

      const sub = interaction.options.getSubcommand();

      if (sub === "on") {
        portalPingsEnabled = true;
        announcedForRaid = null;
        return interaction.reply("✅ **Portal pings enabled**");
      }

      if (sub === "off") {
        portalPingsEnabled = false;
        return interaction.reply("⛔ **Portal pings disabled**");
      }

      if (sub === "status") {
        return interaction.reply(
          `📡 **Portal pings are currently:** ${portalPingsEnabled ? "ON" : "OFF"}`
        );
      }
    }

  } catch (err) {
    console.error("Interaction error:", err);

    if (!interaction.replied) {
      await interaction.reply({
        content: "⚠️ Something went wrong.",
        ephemeral: true
      });
    }
  }
});

// ================= PORTAL ALERT LOGIC =================

setInterval(async () => {
  try {
    if (!portalPingsEnabled) return;

    const raid = getRaidInfo();

    // Send once, ~3 minutes before raid starts
    if (
      !raid.isActive &&
      raid.minutesLeft <= 3 &&
      raid.minutesLeft > 2 &&
      announcedForRaid !== raid.nextRaid
    ) {
      announcedForRaid = raid.nextRaid;

      const channel = await client.channels.fetch(PORTAL_CHANNEL_ID);
      if (!channel) return;

      const roleId = RAID_ROLES[raid.nextRaid];
      const ping = roleId ? `<@&${roleId}>` : "";

      await channel.send(
        `**Portal:**\n` +
        `current portal starts in **3 mins:**\n` +
        `**${raid.nextRaid}**\n\n` +
        `${ping}`
      );
    }

    // Reset after raid starts
    if (raid.isActive) {
      announcedForRaid = null;
    }

  } catch (err) {
    console.error("Portal alert error:", err);
  }
}, 30 * 1000);

// ================= LOGIN =================

client.login(process.env.DISCORD_TOKEN);

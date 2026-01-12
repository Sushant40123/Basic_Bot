require("dotenv").config();
const { Client, GatewayIntentBits, Events, EmbedBuilder } = require("discord.js");
const { getRaidInfo } = require("./raidLogic");

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

// ================= CONFIG =================

const BOT_OWNER_ID = "PASTE_YOUR_USER_ID_HERE";
const PORTAL_CHANNEL_ID = process.env.PORTAL_CHANNEL_ID;

const RAID_ROLES = {
  Goblin: process.env.ROLE_GOBLIN,
  Subway: process.env.ROLE_SUBWAY,
  Infernal: process.env.ROLE_INFERNAL,
  Insect: process.env.ROLE_INSECT,
  Igris: process.env.ROLE_IGRIS,
  Baruka: process.env.ROLE_BARUKA
};

const RAID_COLORS = {
  Goblin: 0x2ecc71,
  Subway: 0x95a5a6,
  Infernal: 0x8e44ad,
  Insect: 0x27ae60,
  Igris: 0x3498db,
  Baruka: 0xe74c3c
};

const RAID_IMAGES = {
  Goblin: "https://media.discordapp.net/attachments/1057604344217870387/1460293518260965648/Goblin.webp?ex=696663d1&is=69651251&hm=72253b987c661bbed33c69b1fa59385a4115f34619d877613ba9366da6c64382&=&format=webp&width=438&height=438",
  Subway: "https://media.discordapp.net/attachments/1057604344217870387/1460293662893277256/Subway.webp?ex=696663f4&is=69651274&hm=6579f94975cdada19c2eb1163d4f0c16d76a6772f041420db8ffccf01ac00311&=&format=webp&width=783&height=783",
  Infernal: "https://media.discordapp.net/attachments/1057604344217870387/1460293791473991691/Infernal.webp?ex=69666412&is=69651292&hm=cc9e866f82210098f2e7c0c47453867b4dd777a076c9b006a30766f174d166cd&=&format=webp&width=438&height=438",
  Insect: "https://media.discordapp.net/attachments/1057604344217870387/1460293902841155864/Insect.webp?ex=6966642d&is=696512ad&hm=497b5bed1fe71c6f562995d181d58da7ada3a0287959801bd5d2fa0dbe6285e0&=&format=webp&width=783&height=783",
  Igris: "https://media.discordapp.net/attachments/1057604344217870387/1460294013725966552/Igris.webp?ex=69666447&is=696512c7&hm=1cea0a0351f5ec03f42e3f9e15254ead509c4ac6dd5bdc08b9ca88271aeb35e1&=&format=webp&width=783&height=783",
  Baruka: "https://media.discordapp.net/attachments/1057604344217870387/1460294133079080970/Baruka.webp?ex=69666464&is=696512e4&hm=a6c2b6049cc4271f4e4737687cd8fe828ffbb4607849b9946c1c46326c2e5052&=&format=webp&width=438&height=438"
};

let portalPingsEnabled = false;
let announcedForRaid = null;

// ================= READY =================

client.once(Events.ClientReady, () => {
  console.log("✅ Bot is online");
});

// ================= COMMANDS =================

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  try {
    // /raid
    if (interaction.commandName === "raid") {
      const raid = getRaidInfo();
      const sub = interaction.options.getSubcommand();

      if (sub === "now") {
        return raid.isActive
          ? interaction.reply(`🔥 **Current Raid:** ${raid.currentRaid}\n⏳ Ends in ${raid.minutesLeft}m ${raid.secondsLeft}s`)
          : interaction.reply("❌ **No raid active right now**");
      }

      if (sub === "next") {
        return interaction.reply(`➡️ **Next Raid:** ${raid.nextRaid}`);
      }
    }

    // /portal (OWNER ONLY)
    if (interaction.commandName === "portal") {
      if (interaction.user.id !== BOT_OWNER_ID) {
        return interaction.reply({ content: "⛔ Not allowed.", ephemeral: true });
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
        return interaction.reply(`📡 **Portal pings:** ${portalPingsEnabled ? "ON" : "OFF"}`);
      }

      // 🧪 TEST COMMAND
      if (sub === "test") {
        const raidName = interaction.options.getString("raid");

        const embed = new EmbedBuilder()
          .setTitle("🌀 PORTAL ALERT (TEST)")
          .setDescription("This is a test portal alert.")
          .setColor(RAID_COLORS[raidName])
          .addFields(
            { name: "⏳ Opens In", value: "3 Minutes", inline: true },
            { name: "🗡 Portal", value: raidName, inline: true }
          )
          .setImage(RAID_IMAGES[raidName])
          .setFooter({ text: "Test mode — no real timer involved." });

        const roleId = RAID_ROLES[raidName];
        const ping = roleId ? `<@&${roleId}>` : "";

        await interaction.reply("🧪 **Test portal sent**");
        await interaction.channel.send({ embeds: [embed] });
        if (ping) await interaction.channel.send(ping);
      }
    }

  } catch (err) {
    console.error(err);
    if (!interaction.replied) {
      interaction.reply({ content: "⚠️ Error occurred.", ephemeral: true });
    }
  }
});

// ================= REAL PORTAL ALERT =================

setInterval(async () => {
  try {
    if (!portalPingsEnabled) return;

    const raid = getRaidInfo();

    if (
      !raid.isActive &&
      raid.minutesLeft <= 3 &&
      raid.minutesLeft > 2 &&
      announcedForRaid !== raid.nextRaid
    ) {
      announcedForRaid = raid.nextRaid;

      const channel = await client.channels.fetch(PORTAL_CHANNEL_ID);
      if (!channel) return;

      const embed = new EmbedBuilder()
        .setTitle("🌀 PORTAL ALERT")
        .setDescription("A dungeon portal is about to open.")
        .setColor(RAID_COLORS[raid.nextRaid])
        .addFields(
          { name: "⏳ Opens In", value: "3 Minutes", inline: true },
          { name: "🗡 Portal", value: raid.nextRaid, inline: true }
        )
        .setImage(RAID_IMAGES[raid.nextRaid])
        .setFooter({ text: "Prepare before the gate opens." });

      const roleId = RAID_ROLES[raid.nextRaid];
      const ping = roleId ? `<@&${roleId}>` : "";

      await channel.send({ embeds: [embed] });
      if (ping) await channel.send(ping);
    }

    if (raid.isActive) {
      announcedForRaid = null;
    }

  } catch (err) {
    console.error("Portal alert error:", err);
  }
}, 30 * 1000);

// ================= LOGIN =================

client.login(process.env.DISCORD_TOKEN);

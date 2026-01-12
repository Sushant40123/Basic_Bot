const PORTAL_CHANNEL_ID = process.env.PORTAL_CHANNEL_ID;

const RAID_ROLES = {
  Goblin: process.env.ROLE_GOBLIN,
  Subway: process.env.ROLE_SUBWAY,
  Infernal: process.env.ROLE_INFERNAL,
  Insect: process.env.ROLE_INSECT,
  Igris: process.env.ROLE_IGRIS,
  Baruka: process.env.ROLE_BARUKA
};

let lastAnnouncedRaid = null;

setInterval(async () => {
  const raid = getRaidInfo();

  // Alert 3 minutes before raid starts
  if (
    !raid.isActive &&
    raid.minutesLeft === 3 &&
    lastAnnouncedRaid !== raid.nextRaid
  ) {
    lastAnnouncedRaid = raid.nextRaid;

    const channel = await client.channels.fetch(PORTAL_CHANNEL_ID);
    if (!channel) return;

    const roleId = RAID_ROLES[raid.nextRaid];
    const ping = roleId ? `<@&${roleId}>` : "";

    channel.send(
      `**Portal:**\n` +
      `current portal starts in **3 mins:**\n` +
      `**${raid.nextRaid}**\n\n` +
      `${ping}`
    );
  }

  // Reset once raid becomes active
  if (raid.isActive) {
    lastAnnouncedRaid = null;
  }
}, 30 * 1000);

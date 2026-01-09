const raids = [
  "Goblin",
  "Subway",
  "Infernal",
  "Insect",
  "Igris",
  "Baruka"
];

const SLOT_MS = 30 * 60 * 1000;   // 30 minutes
const ACTIVE_MS = 15 * 60 * 1000; // 15 minutes

// Known reference: Infernal at 12:30 PM IST
const INFERNAL_INDEX = 2;
const INFERNAL_MIN = 12 * 60 + 30;

function getISTNow() {
  return new Date(
    new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
  );
}

function mod(n, m) {
  return ((n % m) + m) % m;
}

function getRaidInfo() {
  const now = getISTNow();

  const msSinceMidnight =
    (now.getHours() * 60 * 60 +
      now.getMinutes() * 60 +
      now.getSeconds()) * 1000 +
    now.getMilliseconds();

  const currentSlot = Math.floor(msSinceMidnight / SLOT_MS);
  const msIntoSlot = msSinceMidnight % SLOT_MS;

  const infernalSlot = Math.floor((INFERNAL_MIN * 60 * 1000) / SLOT_MS);
  const slotOffset = mod(currentSlot - infernalSlot, raids.length);

  const raidIndex = mod(
    INFERNAL_INDEX + slotOffset,
    raids.length
  );

  const isActive = msIntoSlot < ACTIVE_MS;

  let currentRaid = null;
  let nextRaid;
  let timeLeftMs;

  if (isActive) {
    currentRaid = raids[raidIndex];
    timeLeftMs = ACTIVE_MS - msIntoSlot;
    nextRaid = raids[mod(raidIndex + 1, raids.length)];
  } else {
    timeLeftMs = SLOT_MS - msIntoSlot;
    nextRaid = raids[mod(raidIndex + 1, raids.length)];
  }

  const minutesLeft = Math.floor(timeLeftMs / 60000);
  const secondsLeft = Math.floor((timeLeftMs % 60000) / 1000);

  return {
    isActive,
    currentRaid,
    nextRaid,
    minutesLeft,
    secondsLeft
  };
}

module.exports = { getRaidInfo };

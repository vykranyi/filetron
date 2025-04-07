// utils/schedule.js
function isWithinWorkingHours() {
  const now = new Date();
  const day = now.getDay(); // 0 = Dimanche, 1 = Lundi ... 6 = Samedi
  const hour = now.getHours();
  const minute = now.getMinutes();

  const timeInMinutes = hour * 60 + minute;

  const schedule = {
    1: [570, 1080], // Lundi      09:30–18:00
    2: [570, 1080], // Mardi      09:30–18:00
    3: [570, 1080], // Mercredi   09:30–18:00
    4: [570, 1080], // Jeudi      09:30–18:00
    5: [570, 1080], // Vendredi   09:30–18:00
    6: [660, 960],  // Samedi     11:00–16:00
    0: null         // Dimanche   Fermé
  };

  const range = schedule[day];
  if (!range) return false;

  return timeInMinutes >= range[0] && timeInMinutes < range[1];
}

function getWorkingHoursMessage() {
  return `📅 L’imprimerie est fermée pour le moment.\n🕘 Horaires d’ouverture :\n\n` +
    `📅 Lundi – Vendredi : 09h30 – 18h00\n` +
    `📅 Samedi : 11h00 – 16h00\n` +
    `📅 Dimanche : fermé`;
}

module.exports = {
  isWithinWorkingHours,
  getWorkingHoursMessage
};

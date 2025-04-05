const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const generateTicketSVG = async (user, queueInfo) => {
  const id = queueInfo.id;
  const fileName = `queue-${id}`;
  const svgPath = path.join(__dirname, '../public/tickets', `${fileName}.svg`);
  const pngPath = path.join(__dirname, '../public/tickets', `${fileName}.png`);
  const createdAt = new Date().toLocaleString('uk-UA');

  const svg = `
    <svg width="300" height="180" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" rx="20" fill="#f2f2f2" stroke="#333" stroke-width="2"/>
      <text x="50%" y="30" font-size="18" font-family="sans-serif" text-anchor="middle" fill="#333">
        🎟️ Квиток у чергу
      </text>
      <text x="20" y="60" font-size="14">🆔 ID: ${id}</text>
      <text x="20" y="80" font-size="14">👤 ${user.name}</text>
      <text x="20" y="100" font-size="14">📄 Формат: ${user.format}</text>
      <text x="20" y="120" font-size="14">📃 Сторінок: ${user.pages}</text>
      <text x="20" y="140" font-size="14">⏳ Очікування: ~${queueInfo.eta} хв</text>
      <text x="20" y="160" font-size="12" fill="#666">${createdAt}</text>
    </svg>
  `;

  fs.writeFileSync(svgPath, svg, 'utf-8');

  // 🔁 Конвертація в PNG
  await sharp(Buffer.from(svg)).png().toFile(pngPath);

  return { svgPath, pngPath };
};

module.exports = { generateTicketSVG };

const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');

async function exportAndClearQueue(db) {
  return new Promise((resolve, reject) => {
    db.all(`SELECT * FROM queue ORDER BY id ASC`, async (err, rows) => {
      if (err) return reject(err);
      if (!rows.length) return resolve('📭 Черга порожня, нічого зберігати.');

      const dateStr = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
      const filePath = path.join(__dirname, '../data/queue-backup.xlsx');

      const workbook = new ExcelJS.Workbook();

      // Якщо файл існує — завантажити
      if (fs.existsSync(filePath)) {
        await workbook.xlsx.readFile(filePath);
      }

      // Створити новий аркуш із датою
      const sheet = workbook.addWorksheet(dateStr);

      // Заголовки
      sheet.columns = [
        { header: 'ID', key: 'id', width: 10 },
        { header: 'User ID', key: 'userId', width: 25 },
        { header: 'Імʼя', key: 'name', width: 20 },
        { header: 'Формат', key: 'format', width: 10 },
        { header: 'Сторінки', key: 'pages', width: 10 },
        { header: 'Доставка', key: 'delivery', width: 15 },
        { header: 'Створено', key: 'createdAt', width: 20 },
      ];

      // Дані
      rows.forEach(row => {
        sheet.addRow(row);
      });

      // Зберегти
      await workbook.xlsx.writeFile(filePath);

      // Очистити чергу
      db.run(`DELETE FROM queue`, [], (deleteErr) => {
        if (deleteErr) return reject(deleteErr);
        resolve(`✅ Лист "${dateStr}" додано в queue-backup.xlsx, черга очищена.`);
      });
    });
  });
}

module.exports = { exportAndClearQueue };

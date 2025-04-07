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

      if (fs.existsSync(filePath)) {
        await workbook.xlsx.readFile(filePath);
      }

      const sheet = workbook.addWorksheet(dateStr);

      sheet.columns = [
        { header: 'ID', key: 'id', width: 10 },
        { header: 'ID utilisateur', key: 'userId', width: 25 },
        { header: 'Nom', key: 'name', width: 20 },
        { header: 'Format', key: 'format', width: 10 },
        { header: 'Pages', key: 'pages', width: 10 },
        { header: 'Livraison', key: 'delivery', width: 15 },
        { header: 'Créé le', key: 'createdAt', width: 20 },
      ];

      rows.forEach(row => {
        sheet.addRow(row);
      });

      await workbook.xlsx.writeFile(filePath);

      db.run(`DELETE FROM queue`, [], (deleteErr) => {
        if (deleteErr) return reject(deleteErr);
        resolve(`✅ Лист "${dateStr}" додано в queue-backup.xlsx, черга очищена.`);
      });
    });
  });
}

module.exports = { exportAndClearQueue };

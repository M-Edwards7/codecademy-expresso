const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

function fetchRowById(tableName, id, next, callback) {
    const sql = `SELECT * FROM ${tableName} WHERE id = ?`;
    const values = [id];
    db.get(sql, values, (err, row) => {
        if (err) return next(err);
        callback(row || null);
    });
};

module.exports = fetchRowById;
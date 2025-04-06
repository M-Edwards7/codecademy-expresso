const express = require('express');
const timesheetRouter = express.Router({ mergeParams: true });

const sqlite3 = require('sqlite3');
const fetchRowById = require('./helperfunctions');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

timesheetRouter.param('timesheetId', (req, res, next, timesheetId) => {
    fetchRowById('Timesheet', timesheetId, next, (timesheet) => {
        if (!timesheet) return res.sendStatus(404);
        req.timesheet = timesheet;
        next();
    })
})

timesheetRouter.get('/', (req, res, next) => {
    const sql = `SELECT * FROM Timesheet WHERE employee_id = ?`;
    const value = [req.params.employeeId];

    db.all(sql, value, (err, timesheets) => {
        if (err) return next(err);
        res.status(200).json({ timesheets: timesheets });
    })
});

timesheetRouter.post('/', (req, res, next) => {
    const { hours, rate, date } = req.body.timesheet;
    const employeeId = req.params.employeeId;
    if (!hours || !rate || !date) return res.sendStatus(400);
    const sql = `INSERT INTO Timesheet (hours, rate, date, employee_id) VALUES ($hours, $rate, $date, $employeeId)`;
    const values = {
        $hours: hours,
        $rate: rate,
        $date: date,
        $employeeId: employeeId
    };

    db.run(sql, values, function (err) {
        if (err) return next(err);
        fetchRowById('Timesheet', this.lastID, next, (timesheet) => {
            res.status(201).json({ timesheet: timesheet });
        });
    });
});

timesheetRouter.put('/:timesheetId', (req, res, next) => {
    const { hours, rate, date } = req.body.timesheet;
    const employeeId = req.params.employeeId;
    const timesheetId = req.params.timesheetId;
    const sql = `UPDATE Timesheet SET hours = $hours, rate = $rate, date = $date WHERE employee_id = $employeeId and id = $timesheetId`;
    const values = {
        $hours: hours,
        $rate: rate,
        $date: date,
        $employeeId: employeeId,
        $timesheetId: timesheetId
    }
    fetchRowById('Timesheet', timesheetId, next, (timesheet) => {
        if (!timesheet) return res.sendStatus(404);
    });

    if (!hours || !rate || !date) return res.sendStatus(400);

    db.run(sql, values, function (err) {
        if (err) return next(err);
        fetchRowById('Timesheet', timesheetId, next, (timesheet) => {
            res.status(200).json({ timesheet: timesheet })
        })
    })
});

timesheetRouter.delete('/:timesheetId', (req, res, next) => {
    const timesheetId = req.params.timesheetId;
    const sql = `DELETE FROM Timesheet WHERE id = ?`;
    const value = [timesheetId];
    fetchRowById('Timesheet', timesheetId, next, (timesheet) => {
        if (!timesheet) return res.sendStatus(404);
    });

    db.run(sql, value, function (err) {
        if (err) return next(err);
        res.sendStatus(204);
    })
})

module.exports = timesheetRouter;
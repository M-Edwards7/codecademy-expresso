const express = require('express');
const sqlite3 = require('sqlite3');
const timesheetRouter = require('./timesheets');

const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');
const employeesRouter = express.Router();


employeesRouter.param('employeeId', (req, res, next, employeeId) => {
    fetchEmployeeById(employeeId, next, (employee) => {
        if (!employee) return res.sendStatus(404);
        req.employee = employee;
        next();
    });
});

employeesRouter.use('/:employeeId/timesheets', timesheetRouter);

employeesRouter.get('/', (req, res, next) => {
    const sql = `SELECT * FROM Employee WHERE is_current_employee = 1`;
    db.all(sql, (err, employees) => {
        if (err) {
            return next(err);
        }
        res.status(200).json({ employees: employees });
    });
});

employeesRouter.get('/:employeeId', (req, res, next) => {
    res.status(200).json({ employee: req.employee });
});

employeesRouter.post('/', (req, res, next) => {
    const { name, position, wage } = req.body.employee;
    if (!name || !wage || !position) return res.sendStatus(400);

    const sql = ` INSERT INTO Employee (name, position, wage)
        VALUES ($name, $position, $wage) `;
    const values = {
        $name: name,
        $position: position,
        $wage: wage
    };
    db.run(sql, values, function (err) {
        if (err) return next(err);
        const newEmployeeSql = `SELECT * FROM Employee WHERE id = ?`;
        const values = [this.lastID];

        db.get(newEmployeeSql, values, (err, employee) => {
            if (err) {
                return next(err);
            }
            res.status(201).json({ employee: employee })
        })

    })
});

employeesRouter.put('/:employeeId', (req, res, next) => {
    const { name, position, wage } = req.body.employee;
    const id = req.params.employeeId;
    if (!name || !wage || !position) return res.sendStatus(400);

    const sql = ` UPDATE Employee SET name = $name, position = $position, wage = $wage WHERE id = $employeeId`;
    const values = {
        $name: name,
        $position: position,
        $wage: wage,
        $employeeId: id
    };
    db.run(sql, values, function (err) {
        if (err) return next(err);
        fetchEmployeeById(id, next, (employee) => {
            res.status(200).json({ employee: employee })
        })
    })

});

employeesRouter.delete('/:employeeId', (req, res, next) => {
    const id = req.params.employeeId;
    const sql = `UPDATE Employee SET is_current_employee = 0 WHERE id = ?`;
    const value = [id]
    db.run(sql, value, function (err) {
        if (err) return next(err);
        fetchEmployeeById(id, next, (employee) => {
            return res.status(200).send({ employee: employee })
        })
    })
});

//helper functions
function fetchEmployeeById(id, next, callback) {
    const sql = `SELECT * FROM Employee WHERE id = ?`;
    const values = [id];
    db.get(sql, values, (err, employee) => {
        if (err) return next(err);
        callback(employee || null);
    });
};

module.exports = employeesRouter;
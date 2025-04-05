import sqlite3 from 'sqlite3';
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');


const sqlEmployees = `
  DROP TABLE IF EXISTS Employee;
  CREATE TABLE Employee (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    position TEXT NOT NULL,
    wage INTEGER NOT NULL,
    is_current_employee INTEGER DEFAULT 1
  );
`;

const sqlTimesheets = `
  DROP TABLE IF EXISTS Timesheet;
  CREATE TABLE Timesheet (
    id INTEGER PRIMARY KEY,
    hours INTEGER NOT NULL,
    rate INTEGER NOT NULL,
    date INTEGER NOT NULL,
    employee_id INTEGER NOT NULL,
    FOREIGN KEY(employee_id) REFERENCES Employees(id)
  );
`;

const sqlMenus = `
  DROP TABLE IF EXISTS Menu;
  CREATE TABLE Menu (
    id INTEGER PRIMARY KEY,
    title TEXT NOT NULL
  );
`;

const sqlMenuItems = `
  DROP TABLE IF EXISTS MenuItem;
  CREATE TABLE MenuItem (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    inventory INTEGER NOT NULL,
    price INTEGER NOT NULL,
    menu_id INTEGER NOT NULL,
    FOREIGN KEY(menu_id) REFERENCES Menus(id)
  );
`;

db.serialize(() => {
    db.exec(sqlEmployees, (err) => {
        if (err) {
            console.error('Error executing Employees SQL:', err);
        } else {
            console.log('Employees table created successfully');
        }
    });

    db.exec(sqlTimesheets, (err) => {
        if (err) {
            console.error('Error executing Timesheets SQL:', err);
        } else {
            console.log('Timesheets table created successfully');
        }
    });

    db.exec(sqlMenus, (err) => {
        if (err) {
            console.error('Error executing Menus SQL:', err);
        } else {
            console.log('Menus table created successfully');
        }
    });

    db.exec(sqlMenuItems, (err) => {
        if (err) {
            console.error('Error executing MenuItems SQL:', err);
        } else {
            console.log('MenuItems table created successfully');
        }
    });
});

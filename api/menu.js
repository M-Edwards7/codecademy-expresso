const express = require('express');
const sqlite3 = require('sqlite3');
const fetchRowById = require('./helperfunctions');
const menuItemsRouter = require('./menu-items');


const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');
const menuRouter = express.Router();


menuRouter.param('menuId', (req, res, next, menuId) => {
    fetchRowById('Menu', menuId, next, (menu) => {
        if (!menu) return res.sendStatus(404);
        req.menu = menu;
        next();
    });
});

menuRouter.use('/:menuId/menu-items', menuItemsRouter);

menuRouter.get('/', (req, res, next) => {
    const sql = `SELECT * FROM Menu`;
    db.all(sql, (err, menus) => {
        if (err) return next(err);
        res.status(200).json({ menus: menus });
    });
});

menuRouter.get('/:menuId', (req, res, next) => {
    res.status(200).json({ menu: req.menu });
});

menuRouter.post('/', (req, res, next) => {
    const { title } = req.body.menu;
    const sql = `INSERT INTO Menu (title) VALUES (?)`;
    const value = [title];

    if (!title) return res.sendStatus(400);

    db.run(sql, value, function (err) {
        if (err) return next(err);
        fetchRowById('Menu', this.lastID, next, (menu) => {
            res.status(201).json({ menu: menu });
        });
    });
});

menuRouter.put('/:menuId', (req, res, next) => {
    const { title } = req.body.menu;
    const menuId = req.params.menuId;
    const sql = `UPDATE Menu SET title = $title WHERE id = $id`;
    const values = {
        $title: title,
        $id: menuId
    };
    if (!title) return res.sendStatus(400);

    db.run(sql, values, function (err) {
        if (err) return next(err);
        fetchRowById('Menu', menuId, next, (menu) => {
            res.status(200).json({ menu: menu });
        });
    });
});

menuRouter.delete('/:menuId', (req, res, next) => {
    const menuId = req.params.menuId;
    const menuSql = `DELETE FROM Menu WHERE id = ?`;
    const menuItemSql = `SELECT * FROM MenuItem WHERE menu_id = ?`;
    const value = [menuId]; 

    db.get(menuItemSql, value, (err, menuItem) => {
        if(err) return next(err);
        if(!menuItem){
            db.run(menuSql, value, function(err){
                if(err) return next(err);
                res.sendStatus(204);
            });
        } else {
            return res.sendStatus(400);
        };
    });
});

module.exports = menuRouter;
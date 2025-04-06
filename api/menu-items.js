const express = require('express');
const sqlite3 = require('sqlite3');
const fetchRowById = require('./helperfunctions');


const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');
const menuItemsRouter = express.Router({ mergeParams: true });

menuItemsRouter.param('menuItemId', (req, res, next, menuItemId) => {
    fetchRowById('MenuItem', menuItemId, next, (menuItem) => {
        if (!menuItem) return res.sendStatus(404);
        req.menuItem = menuItem;
        next();
    })
});

menuItemsRouter.get('/', (req, res, next) => {
    const sql = `SELECT * FROM MenuItem WHERE menu_id = ?`;
    const value = [req.params.menuId];

    db.all(sql, value, (err, menuItems) => {
        if (err) return next(err);
        if (!menuItems) return res.sendStatus(404);
        res.status(200).json({ menuItems: menuItems });
    });
});

menuItemsRouter.post('/', (req, res, next) => {
    const { name, description, inventory, price } = req.body.menuItem;
    const menuId = req.params.menuId;
    const sql = `INSERT INTO MenuItem (name, description, inventory, price, menu_id) VALUES ($name, $description, $inventory, $price, $menuId)`;
    const values = {
        $name: name,
        $description: description,
        $inventory: inventory,
        $price: price,
        $menuId: menuId
    };
    fetchRowById('Menu', menuId, next, (menu) => {
        if (!menu) return res.sendStatus(404)
    })
    if (!name || !description || !inventory || !price) return res.sendStatus(400);

    db.run(sql, values, function (err) {
        if (err) return next(err);
        fetchRowById('MenuItem', this.lastID, next, (menuItem) => {
            res.status(201).json({ menuItem: menuItem })
        });

    })
});

menuItemsRouter.put('/:menuItemId', (req, res, next) => {
    const { name, description, inventory, price } = req.body.menuItem;
    const menuId = req.params.menuId;
    const menuItemId = req.params.menuItemId;
    const sql = `UPDATE MenuItem SET name = $name, description = $description, inventory = $inventory, price = $price, menu_id = $menuId WHERE id = $menuItemId`;
    const values = {
        $name: name,
        $description: description,
        $inventory: inventory,
        $price: price,
        $menuId: menuId,
        $menuItemId: menuItemId
    };
    fetchRowById('Menu', menuId, next, (menu) => {
        if (!menu) return res.sendStatus(404);
    });
    if (!name || !description || !inventory || !price) return res.sendStatus(400);

    db.run(sql, values, function (err) {
        if (err) return next(err);
        fetchRowById('MenuItem', menuItemId, next, (menuItem) => {
            res.status(200).json({ menuItem: menuItem });
        });
    });
});

menuItemsRouter.delete('/:menuItemId', (req, res, next) => {
    const menuItemId = req.params.menuItemId;
    const menuId = req.params.menuId;
    const sql = `DELETE FROM MenuItem WHERE id = ?`;
    const value = [menuItemId];
    fetchRowById('Menu', menuId, next, (menu) => {
        if (!menu) return res.sendStatus(404);
    });

    db.run(sql, value, function (err) {
        if (err) return next(err);
        res.sendStatus(204);
    });
});


module.exports = menuItemsRouter;
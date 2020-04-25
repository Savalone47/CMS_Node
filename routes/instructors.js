const router = require('express').Router();
const tables = require('../models/tables');
const db = require('../models/database').getDatabase();
const { validateInstructor } = require('../models/models');

router.get("/", (req, res) => {
    const sqlQuery = `SELECT * FROM ${tables.tableNames.instructor}`;
    db.all(sqlQuery, (err, rows) => {
        if (err) {
            return res.status(500).send({
                message: "An error occurred."
            });
        }
        res.render("../views/instructors.ejs", { instructor: rows });
        console.log(`${req.method} :${req.url}`);
    });
});


router.get("/create", (req, res) => {
    res.render('../views/createInstructor.ejs');
});

router.get("/:id", (req, res) => {
    const sqlQuery = `SELECT * FROM ${tables.tableNames.instructor} WHERE ${tables.instructorColumns.id} = ?`;
    db.get(sqlQuery, [req.params.id], (err, rows) => {
        if (err) {
            return res.status(500).send({
                message: "An error occurred."
            });
        }
        if (!rows) {
            return res.status(404).send({
                message: "An instructor with the requested ID was not found."
            });
        }
        res.render("../views/instructorByID.ejs", { instructor: rows });
    });
});


router.get("/:id/sections", (req, res) => {
    const sqlQuery = `
    SELECT * FROM ${tables.tableNames.section}
    WHERE ${tables.sectionColumns.id} IN
        (SELECT ${tables.teachesColumns.section_id}
        FROM ${tables.tableNames.teaches}
        WHERE ${tables.teachesColumns.instructor_id} = $instructorId
        );
    `;
    db.all(sqlQuery, [req.params.id], (err, rows) => {
        if (err) {
            return res.status(500).send({
                message: "An error occurred."
            });
        }
        if (!rows) {
            return res.status(404).send({
                message: "No sections taught by this instructor could be found."
            });
        }
        res.render("../views/instructorSections.ejs", { section: rows });
    });
});


router.get("/:id/department", (req, res) => {
    const sqlQuery = `
    SELECT * FROM ${tables.tableNames.department}
    WHERE ${tables.deptColumns.deptName} =
        (SELECT ${tables.instructorColumns.department_name} FROM ${tables.tableNames.instructor}
         WHERE ${tables.instructorColumns.id} = ?
         )`;

    db.get(sqlQuery, [req.params.id], (err, row) => {
        if (err) {
            console.log(err);
            return res.status(500).send({
                message: "An error occurred."
            });
        }
        if (!row) {
            return res.status(404).send({
                message: "Department for this instructor not found."
            });
        }
        res.render("../views/instructorDeptt.ejs", { department: row });
    });
});

router.post("/", (req, res) => {
    const { error } = validateInstructor(req.body);
    if (error) {
        return res.status(400).send({
            message: error.details[0].message
        });
    }

    const iname = req.body.name;
    const idept = req.body.department_name;
    const isalary = req.body.salary;
    
    const sqlQuery = `
    INSERT INTO ${tables.tableNames.instructor}
    (name, salary, department_name)
    VALUES ('${iname}', ${isalary}, '${idept}')`;

    db.run(sqlQuery, (err) => {
        if (err) {
            console.log(err);
            return res.status(500).send({
                message: "An error occured while trying to save the instructor details"
            });
        }
        res.render("/instructors");
    });
});

router.delete("/:id", (req, res) => {
    const sqlQuery =
        `DELETE FROM ${tables.tableNames.instructor}
        WHERE ${tables.instructorColumns.id} = ?`;
    db.run(sqlQuery, [req.params.id], (err) => {
        if (err) {
            console.log(err);
            return res.status(500).send({
                message: "An error occurred while trying to delete the instructor"
            });
        }
        return res.send({
            message: "Instructor deleted successfully."
        });
    });
});

/**
 * Internal only route, not a part of the public API
 * This exists because I do not know how to make a delete request
 * from HTML.
 */

router.post("/:id/delete", (req, res) => {
    const sqlQuery =
        `DELETE FROM ${tables.tableNames.instructor}
    WHERE ${tables.instructorColumns.id} = ?`;
    db.run(sqlQuery, [req.params.id], (err) => {
        if (err) {
            console.log(err);
            return res.status(500).send({
                message: "An error occurred while trying to delete the instructor"
            });
        }
        return res.redirect("/instructors");
    });
});

module.exports = router;

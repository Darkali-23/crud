const express = require("express");
const bodyParser = require("body-parser");
const pool = require("../db");

const dishRouter = express.Router();

dishRouter.use(bodyParser.json());

dishRouter
  .route("/")
  .get((req, res, next) => {
    //List all the data in DB
    pool
      .query(`SELECT * FROM public."dishList"`)
      .then(
        (dishes) => {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(dishes.rows);
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  })
  .post((req, res, next) => {
    //Insert the data in DB
    let { id, dishName, rating, origin } = req.body;
    pool.query(
      `INSERT INTO public."dishList"(
        id, "dishName", rating, origin)
        VALUES ($1, $2, $3, $4) RETURNING *`,
      [id, dishName, rating, origin],
      (err, result) => {
        if (err) {
          console.error(err);
        } else {
          console.log(result.rows);
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(result.rows);
        }
      }
    );
  })
  .put((req, res) => {
    res.statusCode = 403;
    res.end("PUT operation not supported on /dishes");
  })
  .delete((req, res, next) => {
    //Delete all the data in DB
    pool
      .query(`DELETE FROM public."dishList"`)
      .then(
        (resp) => {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(
            `Number of rows deleted: ${resp.rowCount} and result: ${resp.oid}`
          );
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  });

dishRouter
  .route("/:dishId")
  .get((req, res, next) => {
    //Select the specific item with given params as dish id
    let dishId = req.params.dishId;
    pool
      .query(`SELECT * FROM public."dishList" WHERE id = $1`, [dishId])
      .then(
        (dishes) => {
          if (dishes.rowCount == 0) {
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.json("There is no data with Id:" + dishId);
          }
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(dishes.rows);
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  })
  .post((req, res) => {
    res.statusCode = 403;
    res.end("PUT operation not supported on /dishes/" + req.params.dishId);
  })
  .put((req, res, next) => {
    //update the data with given params as dish id
    let { dishName, rating, origin } = req.body;
    let dishId = req.params.dishId;
    pool.query(
      `UPDATE public."dishList"
	SET "dishName"=$1, rating=$2, origin=$3
	WHERE id=$4`,
      [dishName, rating, origin, dishId],
      (err, result) => {
        if (err) {
          var err = new Error("Sorry we couldn't update");
          err.status = 403;
          return next(err);
        } else {
          console.log(result);
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json("Updated Successfully");
        }
      }
    );
  })
  .delete((req, res, next) => {
    //delete only the given params dish id
    let dishId = req.params.dishId;
    pool
      .query(`DELETE FROM public."dishList" WHERE id=$1`, [dishId])
      .then(
        (resp) => {
          if (resp.rowCount == 0) {
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.json("There is no data to delete with Id:" + dishId);
          }
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(`Deleted dish with id: ${dishId}`);
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  });

module.exports = dishRouter;

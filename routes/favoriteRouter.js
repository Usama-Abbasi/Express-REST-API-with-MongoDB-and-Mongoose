const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const authenticate = require('../authenticate');
const cors = require('./cors');

const Dishes = require('../models/dishes');

const User = require('../models/user');


const Favorites = require('../models/favorite');

const favoriteRouter = express.Router();

favoriteRouter.use(bodyParser.json());

favoriteRouter.route('/')
    .options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
    .get(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorites.findOne({ user: req.user._id }, (err, favorites) => {
            if (err) {
                return next(err);
            }
            if (!favorites) {
                res.statusCode = 403;
                res.end("No Favorites Found");
            }
        })
            .populate('user')
            .populate('dish')
            .then((favorites) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorites);
            }, (err) => next(err));
    })
    .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorites.findOne({ user: req.user._id }, (err, favorite) => {
            if (err) {
                return next(err);
            }
            if (!favorite) {
                Favorites.create({ user: req.user._id })
                    .then((favorites) => {
                        for (let i = 0; i < req.body.dishes.length; i++) {
                            favorite.dishes.push(req.body.dishes[i]);
                        }
                        favorite.save()
                            .then((favorite) => {
                                Favorites.findById(favorite._id)
                                    .populate('user')
                                    .populate('dishes')
                                    .then((favorites) => {
                                        res.statusCode = 200;
                                        res.setHeader('Content-Type', 'application/json');
                                        res.json(favorite);
                                    })
                            });
                    }, (err) => next(err))
                    .catch((err) => next(err));
            }
            else {
                for (let i = 0; i < req.body.dishes.length; i++) {
                    favorite.dishes.push(req.body.dishes[i]);
                }
                favorite.save()
                    .then((favorite) => {
                        Favorites.findById(favorite._id)
                            .populate('user')
                            .populate('dishes')
                            .then((favorites) => {
                                res.statusCode = 200;
                                res.setHeader('Content-Type', 'application/json');
                                res.json(favorite);
                            })
                    });
            }
        })
    })
    .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        res.statusCode = 403;
        res.end('PUT operation not supported');
    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorites.remove({ user: req.user._id })
            .then((resp) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(resp);
            }, (err) => next(err))
            .catch((err) => next(err));
    })


favoriteRouter.route('/:dishId')
    .options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
    .get(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorites.findOne({ user: req.user._id })
            .then((favorites) => {
                if (!favorites) {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    return res.json({ "exists": false, "favorites": favorites });
                }
                else {
                    if (favorites.dishes.indexOf(req.params.dishId) < 0) {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        return res.json({ "exists": false, "favorites": favorites });
                    }
                    else {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        return res.json({ "exists": true, "favorites": favorites });
                    }
                }
            }, (err) => next(err))
            .catch((err) => next(err))
    })

    .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorites.findOne({ user: req.user._id }, (err, favorite) => {
            if (err) { return next(err); }
            if (!favorite) {
                Favorites.create({ user: req.user._id })
                    .then((favorite) => {
                        favorite.dishes.push(req.params.dishId);
                        favorite.save()
                            .then((favorite) => {
                                Favorites.findById(favorite._id)
                                    .populate('user')
                                    .populate('dishes')
                                    .then((favorites) => {
                                        res.statusCode = 200;
                                        res.setHeader('Content-Type', 'application/json');
                                        res.json(favorite);
                                    })
                            });
                    }, (err) => next(err))
                    .catch((err) => next(err));
            } else {
                if (favorite.dishes.indexOf(req.params.dishId) < 0) {
                    favorite.dishes.push(req.params.dishId);
                    favorite.save()
                        .then((favorite) => {
                            Favorites.findById(favorite._id)
                                .populate('user')
                                .populate('dishes')
                                .then((favorites) => {
                                    res.statusCode = 200;
                                    res.setHeader('Content-Type', 'application/json');
                                    res.json(favorite);
                                })
                        });
                } else {
                    res.statusCode = 200;
                    res.end("Favorite already added!!");
                }
            }
        });
    })
    .put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        res.statusCode = 403;
        res.end(`PUT operation not supported on /leaders`);
    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {

        Favorites.findOne({ user: req.user._id }, (err, favorite) => {
            if (err) {
                return next(err);
            }
            if (!favorite) {
                res.statusCode = 200;
                res.end("No favorite to delete");
            }
            var index = favorite.dishes.indexOf(req.params.dishId);
            if (index > -1) {
                favorite.dishes.splice(index, 1);
                favorite.save()
                    .then((resp) => {
                        Favorites.findById(favorite._id)
                            .populate('user')
                            .populate('dishes')
                            .then((favorites) => {
                                res.statusCode = 200;
                                res.setHeader('Content-Type', 'application/json');
                                res.json(favorite);
                            })
                    }, (err) => next(err))
                    .catch((err) => next(err));
            }
        });
    });


module.exports = favoriteRouter;
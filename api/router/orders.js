const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// Import Order module from /models/order 
const Order = require('../models/order');

// import Product module /models/product
const Product = require('../models/product');

//Handle incoming GET request to /orders
    router.get('/', (req, res, next) => {
        Order.find()
        .select( "product quantity _id")
        .populate('product', 'name price')
        .exec()
        .then(docs => {
            const response = {
                count: docs.length,
                orders: docs.map(doc => {
                   return {
                    product: doc.product,
                    quantity: doc.quantity,
                    _id: doc._id,
                    request: {
                        type: 'GET',
                        url: 'http://localhost:3000/orders/'+ doc._id
                    }
                   }
                })
            }
            res.status(200).json(response);  
        })
        .catch(err => {
            console.log(err);
            res.status(500)
            .json({ error: err })
        });
    });

// Handle incoming POST request to /orders
    router.post('/', (req, res, next) => {
        Product.findById(req.body.productId)
        .exec()
        .then(product => {
            if (!product) {
                res.status(404).json({
                    msg: 'Product Not Found'
                })
            }
            const order = new Order({
                _id: mongoose.Types.ObjectId(),
                quantity: req.body.quantity,
                product: req.body.productId
            });
          return order
            .save()
        })
        .then( result => {
            res.status(201)
            .json({
                msg: 'Order was successful',
                createOrder:{
                    _id: result._id,
                    productId: result.product,
                    quantity: result.quantity,
                     request: {
                         type: 'GET',
                         url: 'http://localhost:3000/orders/' + result._id
                     }
                 }
            })
        })
        .catch(err => {
            console.log(err);
            res.status(500)
            .json({ error: err });
        });
    });

// Handle incoming DELETE request to /orders
    router.delete('/:orderId', (req, res, next) => {
        const id = req.params.orderId;
        Order.deleteOne({_id: id})
        .exec()
        .then( result => {
            res.status(200).json({
                msg: 'Order DELECTED',
                request: {
                    type: 'POST',
                    url: 'http://localhost:3000/orders/',
                    body: {
                        productId: 'ID, required',
                        quantity: 'Number'
                    }
                }
            })
        })
        .catch(err => {
            console.log(err);
            res.status(500)
            .json({error: err});
        });
    });

// Handle single incoming order to /orders/orderId
    router.get('/:orderId', (req, res, next) => {
        const id = req.params.orderId;
        Order.findById({_id: id})
        .populate('product')
        .exec()
        .then( doc => {
            if (doc) {
                res.status(200).json({
                    msg: 'Order Fetched',
                    order: {
                        productId: doc.product,
                        quantity: doc.quantity,
                        request: {
                            type: 'GET',
                            description: 'GET_ALL_ORDER',
                            url: 'http://localhost:3000/orders/'
                        }
                    }
                });
            } else {
                res.status(404).json({ msg: 'Invalid Order ID '+ id });
            }

        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            })
        });
    });

// Export router
module.exports = router
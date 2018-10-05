const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const multer = require('multer');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, new Date().toISOString() + file.originalname);
    }
});

const upload = multer({storage: storage});

// Import schema from /models/product
const Product = require('../models/product');

// Handle income GET request /products
router.get('/', (req, res, next) => {
    Product.find()
    .select( 'name price _id' )
    .exec()
    .then(docs => {
        const response = {
            count: docs.length,
            products: docs.map(doc => {
               return {
                name: doc.name,
                price: doc.price,
                _id: doc._id,
                request: {
                    type: 'GET',
                    url: 'http://localhost:3000/products/'+ doc._id
                }
               }
            })
        }
        if (docs.length !== 0) {
            res.status(200).json({response})
        } else {
            res.status(404).json({
                msg: 'Database is EMPTY'
            })
        }
        
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        })
    })
});

// Handling incoming POST request /products
router.post('/', upload.single('productImage'), (req, res, next) => {
    console.log(req.file);
    const product = new Product({
        _id: new mongoose.Types.ObjectId(),
        name: req.body.name,
        price: req.body.price
    });
    product.save()
    .then(result => {
        res.status(201)
        .json({
            msg: 'Product Created Successfully',
            createProduct: {
                price: result.price,
                name: result.name,
                _id: result._id,
                request: {
                    type: 'GET',
                    url: 'http://localhost:3000/products/'+ result._id
                }
            }
        });
    })
    .catch(err => {
        console.log(err);
        res.status(500)
        .json({
            error: err
        })
    });
});

// Handle POST request for Single data /products/productId
router.get('/:productId', (req, res, next) => {
    const id = req.params.productId;
    Product.findById(id)
    .select("name price _id ")
    .exec()
    .then(doc => {
        if (doc) {
            res.status(200).json({
                product: doc,
                request: {
                    type: 'GET',
                    description: 'GET_ALL_PROD',
                    url: 'http://localhost:3000/products/'
                }
            })
        } else {
            res.status(404).json({ msg: "No value found for provided ID " + id})
        }
    })
    .catch(err => {
        console.log(err);
        res.status(500)
        .json({
            error: err
        });
    });
});


// Handle PATCH Request /products/productId
router.patch('/:productId', (req, res, next) => {
    const id = req.params.productId;
    const updateOps = {};
    for (const ops of req.body) {
        updateOps[ops.propName] = ops.value;
    }
    Product.updateOne({_id: id}, { $set: updateOps })
    .exec()
    .then( result => {
        res.status(200).json({
            msg: 'Product Updated',
            request: {
                type: 'GET',
                url: 'http://localhost:3000/products/'+ id
            }
        })
    })
    .catch(err => {
        console.log(err);
        res.status(500)
        .json({ error: err })
    });
});


// Handle DELETE request /products/productId
router.delete('/:productId', (req, res, next) => {
    const id = req.params.productId;
    Product.deleteOne({_id: id})
    .exec()
    .then(result => {
        res.status(200).json({
            msg: 'Product Deleted',
            request: {
                type: 'POST',
                url: 'http://localhost:3000/products/',
                body: { name: 'String', price: 'Number'}
            }
        });
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        })
    });
});

module.exports = router;
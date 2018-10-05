const express = require('express');
const app = express();
const morgan = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

// Connect to database using Mongoose
mongoose.connect('mongodb://localhost:27017/myshop', {
    useNewUrlParser: true
});

// Global Promise
mongoose.Promise = global.Promise;

// Handles CORS -> Cross-Origin Resources Sharing
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-control-Allow-Headers',"Origin, x-Requested-With, Content-Type, Accept, Authorization");
    if (req.method === 'OPTIONS') {
        res.header('Access-Control-Allow-Methods','PUT, GET, POST, PATCH, DELETE');
        res.status(200).json({});
    }
    next();
});

// Router Handlers
const productRoutes = require('./api/router/products');
const orderRoutes = require('./api/router/orders');

app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


app.use('/products', productRoutes);
app.use('/orders', orderRoutes);
app.use('/', (req, res, next) => {
    res.status(200).json({
        msg: 'myShop v. 1.0.0'
    })
});

// Error Handling 
app.use((req, res, next) => {
    const error = new Error('Not Found');
    error.status = 404;
    next(error);
});

app.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.json({
        error: {
            msg: error.message
        }
    });
})

module.exports = app;
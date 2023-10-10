import express from 'express';
import { ProductManager } from './productManager.js';

import productRouter from './routers/products.router.js'; 
import cartsRouter from './routers/carts.router.js'; 

const PORT = 8080;
const app = express()
app.use(express.urlencoded({ extended: true }));


const productManager = new ProductManager('../products.json');

app.get('/', (req, res) => {
    res.send('<h1>First handover of the Backend Final Project - Commission 47330</h1>')
})

app.use('/api', productRouter, cartsRouter);



app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`)
})
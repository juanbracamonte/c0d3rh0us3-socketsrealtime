import { Router } from 'express';
import { ProductManager } from '../productManager.js';

// funciona con ruta ABSOLUTA pero no con ruta relativa 
const ruta1 = '../products.json'

const productManager = new ProductManager(ruta1);

const router = Router();

// QUERY CON LIMITS
router.get('/products', async (req, res) => {
    try {
        let limit = undefined
        if (req.query.limit) {
            limit = parseInt(req.query.limit);
        }
        const product = await productManager.getProducts(limit)
        if (!limit) {
            res.json(product)
        } else {
            res.send(product.slice(0, limit))
        }
    }
    catch (error) {
        res.status(400).json({ error: 'error' });
    }
})

router.get('/products/:pid', async (req, res) => {
    try {
        const productId = parseInt(req.params.pid)
        const product = await productManager.getProductsById(productId)

        if (!product) {
            res.send('<h1>Sorry! We did not found that Id</h1>')
        } else {
            res.send(product)
        }
    } catch (error) {
        throw new Error(error);
    }

})

router.post('/products', async (req, res) => {
    try {
        const { body } = req;
        const newProduct = {
            ...body,
        }
        await productManager.addProducts(newProduct);
        res.status(201).json(newProduct);
    }

    catch (error) {
        res.status(400).json({ message: error.message })
    }

})

router.put('/products/:pid', async (req, res) => {
    try {
        const productId = parseInt(req.params.pid)
        const { fieldName, newValue } = req.body;

        await productManager.updateProductField(productId, fieldName, newValue);
        res
            .status(200)
            .json({ status: 'success', message: 'Product updated' });
    }
    catch (error) {
        res.status(400).json({ message: error.message })
    }
})

router.delete('/products/:pid', async (req, res) => {
    try {
        const productId = parseInt(req.params.pid)
        const success = await productManager.deleteProductsById(productId)

        if (!success) {
            res
            .status(404)
            .json({ message: 'Product not found' });
        } else {
            res
                .status(200)
                .json({ status: 'success', message: 'Product deleted' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message })
    }

})

export default router;

import { Router } from 'express';


const router = Router();

const products = [
    {
		"id": 1,
		"title": "Producto 1",
		"description": "Este es un producto es el 1",
		"price": 200,
		"thumbnail": "sin imagen",
		"code": "abc123",
		"stock": 25
	  },
    
];

// QUERY CON LIMITS
router.get('/products', async (req, res) => {
    try {
        // let limit = undefined
        if (req.query.limit) {
            limit = parseInt(req.query.limit);
        }
        const product = await productManager.getProducts(limit)

        if (!limit) {
            res.send(product)
        } else {
            res.send(product.slice(0, limit))
        }
    }
    catch (error) {
        throw new Error(error);
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

export default router;
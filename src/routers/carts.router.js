import { Router } from 'express';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ruta = path.join(__dirname, '../carrito.json');

const router = Router();

// Crea un Carrito
router.post('/carts', async (req, res) => {
    const body = req.body;
    const carts = await getJSONFromFile(ruta);
    const { cid, products } = body;

    const newCart = {
        id: uuidv4(),
        products: [],
    };

    carts.push(newCart);
    saveJSONFromFile(ruta, carts);
    res.status(201).json(newCart);
});

// Trae el carrito por ID
router.get('/carts/:cid', async (req, res) => {
    const cid = req.params.cid;
    const carts = await getJSONFromFile(ruta);
    const existingCart = getCartbyId(carts, cid);

    if (!existingCart) {
        console.error('Sorry! We did not find that id');
        res.status(404).json({ message: 'Cart not found' });
    } else {
        res.json(existingCart);
    }
});

// Función para buscar carrito por ID
function getCartbyId(carts, cid) {
    return carts.find(cart => cart.id === cid);
}

// Agregar producto al carrito
router.post('/:cid/product/:pid', async (req, res) => {
    try {
        const cid = req.params.cid;
        const productId = req.params.pid;
        const carts = await getJSONFromFile(ruta);
        const cart = getCartbyId(carts, cid);

        if (!cart) {
            return res.status(404).json({ error: 'El carrito no existe' });
        } else {
            const existingCartItem = cart.products.find(item => item.product === productId);
            const quantityToAdd = req.body.quantity || 1;

            if (!existingCartItem) {
                cart.products.push({
                    product: productId,
                    quantity: quantityToAdd,
                });
            } else {
                existingCartItem.quantity += quantityToAdd;
            }
            await saveJSONFromFile(ruta, carts);
            return res.status(200).json({ message: 'Producto agregado al carrito' });
        }
    } catch (error) {
        console.error('Error adding product to cart:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

//Borrar productos del carrito, especificando cantidad.
router.delete('/:cid/product/:pid', async (req, res) => {
    try {
        const cid = req.params.cid;
        const productId = req.params.pid;
        const quantityToRemove = req.body.quantity || 1; 
        const carts = await getJSONFromFile(ruta);
        const cart = getCartbyId(carts, cid);

        if (!cart) {
            return res.status(404).json({ error: 'El carrito no existe' });
        } else {
            const existingCartItem = cart.products.find(item => item.product === productId);

            if (!existingCartItem) {
                return res.status(404).json({ error: 'El producto no existe en el carrito' });
            } else {
                if (existingCartItem.quantity <= quantityToRemove) {
                    const index = cart.products.indexOf(existingCartItem);
                    cart.products.splice(index, 1);
                } else {
                    existingCartItem.quantity -= quantityToRemove;
                }

                await saveJSONFromFile(ruta, carts);
                return res.status(200).json({ message: 'Cantidad de producto eliminada del carrito' });
            }
        }
    } catch (error) {
        console.error('Error deleting product from cart:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Obtener JSON desde archivo
const getJSONFromFile = async (path) => {
    const content = await fs.promises.readFile(path, 'utf-8');
    try {
        return JSON.parse(content);
    } catch (error) {
        console.error(`Error reading file ${path}: ${error}`);
        throw new Error(`The ${path} file does not have a valid JSON format`);
    }
};

// Tomar objeto JS y pasarlo como JSON al archivo
async function saveJSONFromFile(path, data) {
    const content = JSON.stringify(data, null, '\t');
    try {
        await fs.promises.writeFile(path, content, 'utf-8');
    } catch (error) {
        throw new Error(`The file ${path} could not be written`);
    }
}

export default router;

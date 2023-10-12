import { Router } from 'express';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';


// funciona con ruta ABSOLUTA pero no con ruta relativa 
const ruta = '../carrito.json'

const router = Router();

router.post('/carts', async (req, res) => {
    const body = req.body;
    const carts = await getJSONFromFile(ruta);
    const { cid, products } = body;
    
    const newCart = {
        id: uuidv4(),
        products: [],
    }

    carts.push(newCart)
    saveJSONFromFile(ruta, carts);
    res.status(201).json(newCart);
})



router.get('/carts/:cid', async (req, res) => {
    const carts = await getJSONFromFile(ruta)
    const cid = req.params.cid

    let existingCart = carts.find(cart => cart.id === cid)
    if (!existingCart) {
        
        console.error('Sorry! We did not found that id');
        res.status(404).json({ message: 'Cart not found' });
    }
    res.json(existingCart)
    
})

function getCartbyId(cid) {
    try {
        const carts = getJSONFromFile(ruta);
        let existingCart = carts.find(cart => cart.id === cid);
        if (!existingCart) {
            console.error('Sorry! We did not find that id');
            return null;
        }
        return existingCart;
    } catch (error) {
        console.error('Error getting cart by ID:', error);
        throw error;
    }
}


router.post('/:cid/product/:pid', async (req, res) => {
    try {
        const cid = req.params.cid
        const productId = req.params.pid;
        const carts = await getJSONFromFile(ruta);
        const cart = getCartbyId(cid)

 if (!cart) {
        return res.status(404).json({ error: 'El carrito no existe' });
    }else {
        const existingCartItem = cart.products.find(item => item.product === productId);

        if (!existingCartItem) {
            cart.products.push({ product: productId, quantity: 1 })
        } else {
            existingCartItem.quantity += 1;
        }
        await saveJSONFromFile(ruta, carts);
        return res
        .status(200)
        .json({ message: 'Producto agregado al carrito' });
    }
    } catch {
        console.error('Error adding product to cart:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }

})






// Obtener JSON desde archivo
const getJSONFromFile = async (path) => {
    const content = await fs.promises.readFile(path, 'utf-8');
    try {
        return JSON.parse(content);
    }
    catch (error) {
        console.error(`Error reading file ${path}: ${error}`);
        throw new Error(`The ${path} file does not have a valid JSON format`);
    }

}


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
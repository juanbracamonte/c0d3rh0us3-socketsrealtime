import express from 'express';
import productRouter from './routers/products.router.js'; 
import { ProductManager } from './productManager.js';
import cartsRouter from './routers/carts.router.js';
import handlebars from 'express-handlebars';
import http from 'http';
import { Server } from 'socket.io';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs/promises'; 

const PORT = 8080;
const app = express();
const server = http.createServer(app);
const io = new Server(server);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ruta1 = path.join(__dirname, './products.json');
const productManager = new ProductManager(ruta1);

app.locals.layout = false;
// config Handlebars
app.engine('handlebars', handlebars.engine());
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'handlebars');

// config Handlebars
app.engine('handlebars', handlebars.engine());
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'handlebars');

// Rutas
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.send('<h1>First handover of the Backend Final Project - Commission 47330</h1>')
});

app.use('/api', productRouter);
app.use('/api', cartsRouter);

app.get('/home', async (req, res) => {
    try {
        const products = await productManager.getProducts();
        res.render('home', { products });
    } catch (error) {
        console.error('Error getting products', error);
        res.status(500).send('Error 500 :S');
    }
});

app.get('/realtimeproducts', async (req, res) => {
    try {
        const data = await fs.readFile('products.json', 'utf8');
        const products = JSON.parse(data);
        res.render('realTimeProducts', { products });
    } catch (error) {
        console.error('read error products.json', error);
        res.status(500).send('Error 500 :S');
    }
});

// Socket.io - Configuración básica
io.on('connection', (socket) => {
    console.log('User connect :D');

    socket.on('disconnect', () => {
        console.log('User disconnected :(');
    });
});

export { io };
// Iniciar el servidor
server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

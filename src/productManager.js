import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { io } from './app.js';
export class ProductManager {

    constructor(path) {
        this.path = path;
    }

    async addProducts(product) {
        const { title, description, price, status, stock, category, thumbnail, code } = product;
        const products = await getJSONFromFile(this.path)

        if (!title || !description || !price || !status || !stock || !category || !code) {
            throw new Error('All fields are required.');
        }

        // validacion de que el campo code no se repita
        let existingCode = products.find(product => product.code === code);
        if (existingCode) {
            throw new Error('That code already exists');
        }
        const id = uuidv4();
        const newProduct = { id, title, description, price, status, stock, category, thumbnail, code };
        products.push(newProduct);

        await saveJSONFromFile(this.path, products);

        io.emit('productCreated', newProduct);

        return newProduct;
    }

    async getProducts() {
        try {
            return await getJSONFromFile(this.path);
        } catch (error) {
            console.error('Error reading products file:', error);
            throw new Error('Unable to read products file');
        }
    }


    async getProductsById(id) {
        const products = await getJSONFromFile(this.path)
        let existingId = products.find(product => product.id === id)
        if (!existingId) {
            console.error('Sorry! We did not found that id');
            return null;
        }
        return existingId
    }

    async updateProduct(id, newTitle, newDescription, newPrice, newStatus, newStock, newCategory, newThumbnail, newCode) {
        const products = await getJSONFromFile(this.path)
        let existingId = products.find(product => product.id === id)

        if (!existingId) {
            console.error('Sorry! We did not found that id');
            return null;
        } if (
            newTitle !== undefined &&
            newDescription !== undefined &&
            newPrice !== undefined &&
            newStatus !== undefined &&
            newStock !== undefined &&
            newCategory !== undefined &&
            newThumbnail !== undefined &&
            newCode !== undefined) {

            existingId.title = newTitle;
            existingId.description = newDescription;
            existingId.price = newPrice;
            existingId.status = newStatus;
            existingId.stock = newStock;
            existingId.category = newCategory;
            existingId.thumbnail = newThumbnail;
            existingId.code = newCode;

            await saveJSONFromFile(this.path, products);
            console.log('The product was successfully updated', existingId);
        } else {
            console.error('All fields are required for the update');
            return null;
        }
    }

    async updateProductField(id, fieldName, newValue) {
        const products = await getJSONFromFile(this.path);
        const existingId = products.find(product => product.id === id);

        if (!existingId) {
            console.error('Sorry! We did not find that id');
            return null;
        }

        if (fieldName in existingId) {
            existingId[fieldName] = newValue;

            await saveJSONFromFile(this.path, products);
            console.log(`The ${fieldName} of the product with ID ${id} was successfully updated to ${newValue}`);
        } else {
            console.error(`Field ${fieldName} does not exist in the product`);
            return null;
        }
    }



    async deleteProductsFile() {
        try {
            await fs.promises.unlink(this.path)
            console.log('The file was deleted correctly')
        } catch (error) {
            throw new Error(`The file ${path} could not be deleted.`);
        }
    }

    async deleteProductsById(id) {
        const products = await getJSONFromFile(this.path);
        const updatedProducts = products.filter(product => String(product.id) !== id); // 

        if (products.length > updatedProducts.length) {
            await saveJSONFromFile(this.path, updatedProducts, 'utf-8');
            console.log('The product was successfully deleted');
            io.emit('productDeleted', id); 
            return true;
        } else {
            console.log('Sorry! We could not delete product');
            return false;
        }
    }
}

// Chequeo la existencia del archivo
// const existingFile = async (path) => {
//     try {
//         await fs.promises.access(path);
//         return true;
//     } catch (error) {
//         return false
//     }
// };

// Obtener JSON desde archivo
const getJSONFromFile = async (path) => {
    // if (!await existingFile(path)) {
    //     console.log(`File not found at path: ${path}`);
    //     return [];
    // }
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

const productManager = new ProductManager('../products.json');






export class ProductManager {

    constructor(path) {
        this.path = path;
    }

    async addProducts(product) {
        const { title, description, price, thumbnail, code, stock } = product;
        const products = await getJSONFromFile(this.path)

        if (!title || !description || !price || !thumbnail || !code || !stock) {
            throw new Error('All fields are required.');
        }

        // validacion de que el campo code no se repita
        let existingCode = products.find (product => product.code === code);
        if(existingCode) {
            console.log('El codigo de producto ingresado ya existe');
            return;
        }


        const id = products.length + 1;
        const newProduct = { id, title, description, price, thumbnail, code, stock };
        products.push(newProduct);

        return saveJSONFromFile(this.path, products)

    }

    getProducts() {
        return getJSONFromFile(this.path)
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

    async updateProduct(id, newTitle, newDescription, newPrice, newThumbnail, newCode, newStock) {
        const products = await getJSONFromFile(this.path)
        let existingId = products.find(product => product.id === id)

        if (!existingId) {
            console.error('Sorry! We did not found that id');
            return null;
        } if (
            newTitle !== undefined &&
            newDescription !== undefined &&
            newPrice !== undefined &&
            newThumbnail !== undefined &&
            newCode !== undefined &&
            newStock !== undefined ) {

            existingId.title = newTitle;
            existingId.description = newDescription;
            existingId.price = newPrice;
            existingId.thumbnail = newThumbnail;
            existingId.code = newCode;
            existingId.stock = newStock;
    

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
        const products = await getJSONFromFile(this.path)
        let index = products.find(product => product.id === id)

        if (index !== 1) {
            products.splice(index, 1);
            await saveJSONFromFile(this.path, products)
            console.log('The product was successfully deleted')
        } else {
            console.log('Sorry! We could not delete product')
        }

    }


}

// Chequeo la existencia del archivo
const existingFile = async (path) => {
    try {
        await fs.promises.access(path);
        return true;
    } catch (error) {
        return false
    }
};

// Obtener JSON desde archivo
const getJSONFromFile = async (path) => {
    if (!await existingFile(path)) {
        return [];
    }
    const content = await fs.promises.readFile(path, 'utf-8');
    try {
        return JSON.parse(content);
    }
    catch (error) {
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

const pruebaDesafio = async () => {

    try {
        const productManager = new ProductManager('../products.json');
        // await productManager.addProducts({
        //     title: "producto prueba",
        //     description: "Este es un producto prueba",
        //     price: 200,
        //     thumbnail: "sin imagen",
        //     code: "abc123",
        //     stock: 25,
        // });

        const products = await productManager.getProducts();
        // console.log("getProdcuts", 'Here are the products:', products);

        // productManager.getProductsById() // ingresar Id a buscar
        // productManager.deleteProductsById() // ingresar Id a borrar
        // productManager.updateProduct() // ingresar los valrores a actualizar por props (id que se quiere modificar, 'Nuevo Titulo', 'Nueva descripcion', 500, 'Nueva Ruta', 'NuevoCodigo123", 30)
        // productManager.updateProductField (2,'title', 'Actualizo el titulo solamente2') // ingresar el id, el nombre y el valor a actualizar por props (id que se quiere modificar, 'title', 'Actualizo el titulo solamente' )
        // // productManager.deleteProductsFile();

    } catch (error) {
        console.error(' Ha ocurrido un error: ', error.message)
    }

}

pruebaDesafio()


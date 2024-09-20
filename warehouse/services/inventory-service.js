const axios = require('axios');

exports.getInventoryById = async(productId) => {
    try {
        const response = await axios.get(`http://localhost:3001/inventory/${productId}`);
        return response.product
    }
    catch(error) {
        next(err)
    }
}
const axios = require('axios');

exports.getInventoryById = async(productId) => {
    try {
        const response = await axios.get(`http://localhost:3001/inventory/${productId}`);
        return response.product
    }
    catch(err) {
        next(err)
    }
}

exports.deleteInventoryByWarehouseId = async(warehouseId) => {
    try {
        const response = await axios.delete(`http://localhost:3001/inventory/${warehouseId}`);
        return response.message
    }
    catch(err) {
        next(err)
    }
}
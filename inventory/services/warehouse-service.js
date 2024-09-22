const axios = require('axios');

//Find warehouse by id
exports.getWarehouseById = async(warehouseId) => {
    try {
        const response = await axios.get(`http://localhost:3003/warehouse/${warehouseId}`);
        return response.warehouse;
    } 
    catch(error) {
        next(err)
    }
};

exports.getWarehouseByInventoryId = async(inventoryId) => {
    try {
        const response = await axios.get(`http://localhost:3003/warehouse/${inventoryId}`);
        return response.warehouse;
    } 
    catch(error) {
        next(err)
    }
}

//Find all warehouses for user(find) - GET /warehouse
exports.getWarehouses = async() => {
    try {
        const response = await axios.get(`http://localhost:3003/warehouse`);
        return response.warehouses;
    } 
    catch(error) {
        next(err)
    }
};

exports.updateInventoryInWarehouse = async(warehouseId, inventoryStored) => {
    try {
        const response = await axios.patch(`http://localhost:3003/warehouse/${warehouseId}`, {
            inventoryStored
        });
        return response.warehouse;
    } 
    catch(error) {
        next(err)
    }
}
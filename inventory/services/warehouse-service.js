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


//Find warehouse by id and update(findByIdAndUpdate) - PATCH /warehouse/:id

//Find warehouse such that in Warehouse, ObjectId of inventoryStored[] matched what we searched(findOne)
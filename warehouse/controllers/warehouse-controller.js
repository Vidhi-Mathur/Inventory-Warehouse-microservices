const axios = require('axios')
const Warehouse = require('../models/warehouse-model')
/* Fix remaining for inventory reference 
const Inventory = require('../models/inventory-model') */
const { getInventoryById } = require('../services/inventory-service');
const { getUserById } = require('../services/user-service');

//Create warehouse
exports.createWarehouse = async(req, res, next) => {
    try {
        const { name, location, inventoryStored } = req.body;
        // Find location
        const result = await axios.get(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(location)}&format=json`);
        if(result.data.length === 0) return res.status(400).json({message: 'Invalid location'});
        const { lat, lon } = result.data[0];
        // Find associated inventory
        const inventoryItems = await Inventory.find({ _id: { $in: inventoryStored } });
        // Check if all inventory items were found
        if(inventoryItems.length !== inventoryStored.length) {
            return res.status(404).json({message: 'Not all inventory items found'});
        }
        // Get username from warehouse, and save corresponding warehouse there
        const user = req.session.user;
        const correspondingUser = await getUserById(user)
        // Create new warehouse
        const newWarehouse = await Warehouse.create({
            name,
            location: { lat, lng: lon },
            inventoryStored,
            user: correspondingUser._id 
        });
        correspondingUser.warehouses.push(newWarehouse._id);
        // Update Inventory for warehouse id
        for(const inventoryItem of inventoryItems) {
            inventoryItem.warehouse = newWarehouse._id;
            await inventoryItem.save();
        }
        await correspondingUser.save();
        res.status(200).json({ warehouse: newWarehouse });
    } 
    catch(err) {
        next(err)
    }
};

//Retrieve a single warehouse using Id
exports.getWarehouseById = async (req, res, next) => {
    const { id } = req.params;
    let storedWarehouse;
    try {
        storedWarehouse = await Warehouse.findById(id);
        if (!storedWarehouse || !storedWarehouse.user.equals(req.session.user)) return res.status(404).json({message: 'No warehouse found for given id'});
        res.status(200).json({ warehouse: storedWarehouse });
    } 
    catch(err) {
        next(err)
    }    
};

//Retrieve all warehouses
exports.getWarehouses = async(req, res, next) => {
    let storedWarehouses
    try {
        storedWarehouses = await Warehouse.find({ user: req.session.user })
        res.status(200).json({ warehouses: storedWarehouses })
    }
    catch(err){
        next(err)
    }
}

//Update warehouse
exports.updateWarehouse = async(req, res, next) => {
    const { id } = req.params;
    const { name, location, inventoryStored, user } = req.body;
    let storedWarehouse, oldUser, newUser;
    try {
        // Find warehouse by id
        storedWarehouse = await Warehouse.findById(id);
        if (!storedWarehouse) return res.status(404).json({message: 'Warehouse not found'});
        // Fetch latitude and longitude based on new location
        const result = await axios.get(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(location)}&format=json`);
        if (result.data.length === 0) return res.status(400).json({message: 'Invalid location'});
        const { lat, lon } = result.data[0];
        // Update warehouse details
        storedWarehouse.name = name;
        storedWarehouse.location = { lat, lng: lon };
        if(!storedWarehouse.user.equals(req.session.user)) return res.status(401).json({message: 'Unauthorized'});
        //Pull out old reference, and store new 
        await Warehouse.updateMany(
            { inventoryStored: { $in: inventoryStored } },
            { $pull: { inventoryStored: { $in: inventoryStored } } }
        );
        // Iterate through the inventoryStored array to update the warehouse field in each inventory item
        for (const inventoryId of inventoryStored) {
            const inventoryItem = await getInventoryById(inventoryId);
            if (inventoryItem) {
                inventoryItem.warehouse = id;
                await inventoryItem.save();
            }
        }
        // Update inventoryStored array in warehouse
        storedWarehouse.inventoryStored = inventoryStored;
        if(user){
            //Update warehouses[] in User by removing reference of current warehouse from oldUser and adding to newUser
            oldUser = await getUserById(req.session.user)
            oldUser.warehouses = await oldUser.warehouses.filter(prevId => prevId.toString() !== id)
            await oldUser.save()
            newUser = await getUserById(user)
            newUser.warehouses.push(id)
            await newUser.save()
            //update user in warehouse
            storedWarehouse.user = newUser._id
        }
        // Save updated warehouse
        await storedWarehouse.save();
        // Response
        res.status(200).json({ warehouse: storedWarehouse });
    } 
    catch (err) {
        next(err)
    }
};

//Delete warehouse
exports.deleteWarehouse = async(req, res, next) => {
    const { id } = req.params;
    let deleteWarehouse;
    try {
        deleteWarehouse = await Warehouse.findById(id);
        if (!deleteWarehouse) return res.status(404).json({message: 'No warehouse found'});
        // Remove inventory associated with deleted warehouse
        await Inventory.deleteMany({ warehouse: id });
        // Remove warehouse from the user who owns it
        const owner = deleteWarehouse.user;
        const correspondingUser = await getUserById(owner);
        if (!correspondingUser) return res.status(404).json({message: 'No user found'});
        correspondingUser.warehouses = correspondingUser.warehouses.filter(warehouseId => warehouseId.toString() !== id);
        await correspondingUser.save();
        // Delete warehouse
        await Warehouse.findByIdAndDelete(id);
        res.status(200).json({ message: `Deleted warehouse with id ${id}` });
    } 
    catch(err) {
        next(err)
    }
}
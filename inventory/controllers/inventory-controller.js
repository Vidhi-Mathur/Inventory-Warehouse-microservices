const Inventory = require('../models/inventory-model')
const { getWarehouseById, getWarehouses, getWarehouseByInventoryId, updateInventoryInWarehouse } = require("../services/warehouse-service")

exports.createProduct = async (req, res, next) => {
   try {
       const { title, price, description, quantity, imageUrl, warehouse } = req.body;
       // Update warehouse to update inventory stored
       const reqWarehouse = await getWarehouseById(warehouse);
       //Warehouse doesn't exist
       if (!reqWarehouse) {
           return res.status(404).json({ message: 'No warehouse found' });
       }
       //Missing field
       if(!title || !price ||  !description || !quantity || !imageUrl || !warehouse){
            return res.status(400).json({ message: 'Missing fields' });
       }
       //Save product
       const newProduct = new Inventory({ title, price, description, quantity, imageUrl, warehouse });
       await newProduct.save();
       //Update inventoryStored[] in warehouse
       reqWarehouse.inventoryStored.push(newProduct._id);
       await updateInventoryInWarehouse(reqWarehouse.id, reqWarehouse.inventoryStored)
       //Return response
       res.status(200).json({ product: newProduct });
   } 
   catch(err) {
      next(err)
   }
};

//Retrieve single inventory item using id
exports.getProductById = async(req, res, next) => {
   const  { id }  = req.params
   let storedProduct, correspondingWarehouse;
   try {
      //Search
      storedProduct = await Inventory.findById(id);
      correspondingWarehouse = await getWarehouseById(storedProduct.warehouse)
      if(!storedProduct || !correspondingWarehouse || !correspondingWarehouse.user.equals(req.session.user)) return res.status(404).json({ message: 'No product found for given id'})
        res.status(200).json({product: storedProduct})
   }
   catch(err){
      next(err)
   }
}

//Retrieve all inventory items
exports.getProducts = async(req, res, next) => {
   let storedProducts, correspondingWarehouse;
   try {
      correspondingWarehouse = await getWarehouses()
      //Get all products, so no criteria
      storedProducts = await Inventory.find({ warehouse: correspondingWarehouse })
      res.status(200).json({products: storedProducts})
   }
   catch(err){
    next(err)
   }
}

//Update specific inventory item
exports.updateProduct = async(req, res, next) => {
   const { id } = req.params
   const { title, price, description, quantity, imageUrl, warehouse } = req.body
   let inventory, oldWarehouse, newWarehouse
   try {
   //Find id in database
   inventory = await Inventory.findById(id)
   if(!inventory) return res.status(404).json({ message: 'Inventory Not found'})
   //Find warehouse such that in Warehouse, ObjectId of inventoryStored[] matched what we searched
   oldWarehouse = await getWarehouseByInventoryId(id)
   if(!oldWarehouse) return res.status(404).json({ message: 'Warehouse Not found'})
   //Update
   inventory.title = title
   inventory.price = price
   inventory.description = description
   inventory.quantity = quantity
   inventory.imageUrl = imageUrl
   inventory.warehouse = warehouse
   //Save
   await inventory.save()
   //Remove Id of inventory updated from old warehouse
   oldWarehouse.inventoryStored = oldWarehouse.inventoryStored.filter(itemId => itemId.toString() !== id);
   await oldWarehouse.save();
   newWarehouse = await getWarehouseById(warehouse);
   //Update reference of inventoryStored[] in new Warehouse
   if (!newWarehouse.inventoryStored.includes(inventory._id)) {
      newWarehouse.inventoryStored.push(inventory._id);
      await newWarehouse.save();
  }
   //Response
   res.status(200).json({product: inventory})
   }
   catch(err){
      next(err)
    }
}

//Delete inventory item
exports.deleteProductByProductId = async(req, res, next) => {
   const { productId } = req.params;
   let deleteInventory;
   try {
      deleteInventory = await Inventory.findById(productId);
      // No id found
      if (!deleteInventory) {
        return res.status(404).json({ message: "No product found for given id"})
      }
      const warehouse = await getWarehouseById(deleteInventory.warehouse);
      // Remove reference of same inventory stored with Warehouse model, and save
      warehouse.inventoryStored = warehouse.inventoryStored.filter(item => item.toString() !== productId);
      await warehouse.save()
      await Inventory.findByIdAndDelete(productId);
      res.status(200).json({message: `Deleted product with id ${productId}`});
   } 
   catch(err) {
      next(err)
   }
}

exports.deleteProductByWarehouseId = async(req, res, next) => {
    try {
        const { warehouseId } = req.params
        await Inventory.deleteMany({ warehouse: warehouseId });
        res.status(200).json({message: "Deleted inventories from warehouse"})
    }
    catch(err) {
        next(err)
    }
}
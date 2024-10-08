const express = require('express')
const router = express.Router()
const invertoryController = require('../controllers/inventory-controller')

//Retrieve single inventory item using id
router.get('/:id', invertoryController.getProductById)

//Retrieve all inventory items
router.get('/', invertoryController.getProducts)

//Create inventory product
router.post('/new', invertoryController.createProduct)

//Update specific inventory item
router.patch('/:id', invertoryController.updateProduct)

//Delete inventory item based on ProductId
router.delete('/:productId', invertoryController.deleteProductByProductId)

//Delete inventory item based on warehouseId
router.delete('/:warehouseId', invertoryController.deleteProductByWarehouseId)

module.exports = router
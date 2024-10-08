const express = require('express')
const router = express.Router()
const warehouseController = require('../controllers/warehouse-controller')

//Retrieve a single warehouse using Id
router.get('/:id', warehouseController.getWarehouseById)

router.get('/:inventoryId', warehouseController.getWarehouseByInventoryId)

//Retrieve all warehouses
router.get('/', warehouseController.getWarehouses)

//Create warehouse
router.post('/new', warehouseController.createWarehouse)

//Update warehouse
router.patch('/:id', warehouseController.updateWarehouse)

router.patch('/:warehouseId', warehouseController.updateInventoryInWarehouse)

//Delete warehouse
router.delete('/:id', warehouseController.deleteWarehouse)

module.exports = router
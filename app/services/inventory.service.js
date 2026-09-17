const { inventoryItemRepo, inventoryMovementRepo } = require('../repositories/operations.repo');
const auditService = require('./audit.service');
const IdGenerator = require('../utils/idGenerator');
const { AUDIT_ACTION, INVENTORY_MOVEMENT_TYPE } = require('../constants/statuses');

class InventoryService {
  async getItems() {
    return inventoryItemRepo.find({ orderBy: { field: 'name', direction: 'asc' } });
  }

  async addItem(data, req = null) {
    const itemId = IdGenerator.prefixedId('inv');
    const quantity = Number(data.quantity || 0);
    const itemPayload = {
      ...data,
      quantity,
      minStockAlert: Number(data.minStockAlert || 5),
      createdAt: new Date().toISOString()
    };

    const created = await inventoryItemRepo.create(itemId, itemPayload);

    // Initial stock movement record
    if (quantity > 0) {
      await this.recordMovement({
        itemId,
        itemName: data.name,
        type: INVENTORY_MOVEMENT_TYPE.STOCK_IN,
        quantity,
        reason: 'Initial stock intake',
        reference: 'INITIAL'
      }, req);
    }

    await auditService.record({
      req,
      action: AUDIT_ACTION.CREATE,
      module: 'INVENTORY',
      entityType: 'ITEM',
      entityId: itemId,
      after: created
    });

    return created;
  }

  /**
   * Records a stock movement and automatically updates inventory balance
   */
  async recordMovement(params, req = null) {
    const { itemId, itemName, type, quantity, reason = '', reference = '' } = params;
    const item = await inventoryItemRepo.findById(itemId);
    if (!item) throw new Error('Inventory item not found');

    const qty = Number(quantity);
    if (qty <= 0) throw new Error('Quantity must be greater than zero');

    let newQuantity = item.quantity;
    if (type === INVENTORY_MOVEMENT_TYPE.STOCK_IN || type === INVENTORY_MOVEMENT_TYPE.RETURN) {
      newQuantity += qty;
    } else if (type === INVENTORY_MOVEMENT_TYPE.STOCK_OUT || type === INVENTORY_MOVEMENT_TYPE.SCRAP) {
      if (item.quantity < qty) {
        throw new Error(`Insufficient stock for "${item.name}". Current available: ${item.quantity}`);
      }
      newQuantity -= qty;
    } else if (type === INVENTORY_MOVEMENT_TYPE.ADJUSTMENT) {
      newQuantity = qty; // Direct adjustment to target count
    }

    const movementId = IdGenerator.prefixedId('mov');
    const movement = {
      id: movementId,
      itemId,
      itemName: itemName || item.name,
      type,
      quantity: qty,
      previousQuantity: item.quantity,
      newQuantity,
      reason,
      reference,
      performedBy: req?.user?.id || 'INVENTORY_MGR',
      createdAt: new Date().toISOString()
    };

    await inventoryMovementRepo.create(movementId, movement);
    await inventoryItemRepo.update(itemId, { quantity: newQuantity });

    await auditService.record({
      req,
      action: AUDIT_ACTION.UPDATE,
      module: 'INVENTORY',
      entityType: 'STOCK_MOVEMENT',
      entityId: movementId,
      after: movement
    });

    return movement;
  }

  async getMovements(itemId = null) {
    if (itemId) {
      return inventoryMovementRepo.findByItem(itemId);
    }
    return inventoryMovementRepo.find({ orderBy: { field: 'createdAt', direction: 'desc' }, limit: 100 });
  }

  async getLowStockAlerts() {
    return inventoryItemRepo.findLowStock();
  }
}

module.exports = new InventoryService();

const { transportRepo } = require('../repositories/operations.repo');
const auditService = require('./audit.service');
const IdGenerator = require('../utils/idGenerator');
const { AUDIT_ACTION } = require('../constants/statuses');

class TransportService {
  async getRoutes() {
    return transportRepo.find({ orderBy: { field: 'createdAt', direction: 'desc' } });
  }

  async createRoute(routeData, req = null) {
    const routeId = IdGenerator.prefixedId('trn');
    const payload = {
      ...routeData,
      vehicleCapacity: Number(routeData.vehicleCapacity || 35),
      monthlyFee: Number(routeData.monthlyFee || 80.00),
      stops: Array.isArray(routeData.stops) ? routeData.stops : (routeData.stopsStr ? routeData.stopsStr.split(',').map(s => s.trim()) : ['Main Campus']),
      assignedStudentsCount: 0,
      status: 'ACTIVE',
      createdAt: new Date().toISOString()
    };

    const created = await transportRepo.create(routeId, payload);

    await auditService.record({
      req,
      action: AUDIT_ACTION.CREATE,
      module: 'TRANSPORT',
      entityType: 'ROUTE',
      entityId: routeId,
      after: created
    });

    return created;
  }

  async getRouteById(id) {
    return transportRepo.findById(id);
  }
}

module.exports = new TransportService();

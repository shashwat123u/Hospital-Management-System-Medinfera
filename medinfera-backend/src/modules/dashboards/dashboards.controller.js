const service = require('./dashboards.service');
const response = require('../../utils/response');
const asyncHandler = require('../../utils/asyncHandler');

const getSummary = asyncHandler(async (req, res) => {
  const role = req.user.role;
  let stats = null;

  try {
    switch (role) {
      case 'SUPER_ADMIN':
        stats = await service.getSuperAdminStats();
        break;
      case 'ADMIN':
        stats = await service.getAdminStats(req.user);
        break;
      case 'DOCTOR':
        stats = await service.getDoctorStats(req.user);
        break;
      case 'PATIENT':
        stats = await service.getPatientStats(req.user);
        break;
      case 'PHARMACIST':
        stats = await service.getPharmacistStats(req.user);
        break;
      case 'RECEPTIONIST':
        stats = await service.getReceptionistStats(req.user);
        break;
      case 'NURSE':
        stats = await service.getNurseStats(req.user);
        break;
      default:
        stats = {};
    }
    response.success(res, stats);
  } catch (err) {
    console.error('Dashboard Error:', err);
    response.error(res, `Dashboard Error: ${err.message}`, 500, err.stack);
  }
});

module.exports = { getSummary };

const prisma = require('../../config/database');

const getAdminStats = async (actor) => {
  const hospitalId = actor.hospitalId;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [
    totalPatients,
    todayAppointments,
    lowStockMedicines,
    monthlyRevenue
  ] = await Promise.all([
    prisma.patientProfile.count({ where: { hospitalId } }),
    prisma.appointment.count({ 
      where: { 
        hospitalId, 
        appointmentDate: today,
        status: { notIn: ['CANCELLED', 'NO_SHOW'] }
      } 
    }),
    prisma.medicine.count({ 
      where: { 
        hospitalId,
        isActive: true,
        // Prisma doesn't support comparing two columns directly in where.
        // We'll use a simple threshold or filter manually for dashboard stats.
        currentStock: { lte: 10 } 
      } 
    }),
    prisma.invoice.aggregate({
      where: { 
        hospitalId,
        createdAt: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) }
      },
      _sum: { totalAmount: true }
    })
  ]);

  return {
    totalPatients,
    todayAppointments,
    lowStockMedicines,
    monthlyRevenue: monthlyRevenue._sum.totalAmount || 0,
    activeDoctors: await prisma.doctorProfile.count({ where: { hospitalId, user: { isActive: true } } }),
    occupancyRate: 0, // Implement later with bed status
  };
};

const getDoctorStats = async (actor) => {
  const hospitalId = actor.hospitalId;
  const doctor = await prisma.doctorProfile.findFirst({ where: { userId: actor.id } });
  if (!doctor) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [
    todayAppts,
    totalPatients,
    pendingPrescriptions,
    schedule
  ] = await Promise.all([
    prisma.appointment.count({ where: { doctorId: doctor.id, appointmentDate: today, status: { notIn: ['CANCELLED', 'NO_SHOW'] } } }),
    prisma.appointment.groupBy({ by: ['patientId'], where: { doctorId: doctor.id } }).then(res => res.length),
    prisma.appointment.count({ where: { doctorId: doctor.id, status: 'CONFIRMED' } }),
    prisma.appointment.findMany({
      where: { doctorId: doctor.id, appointmentDate: today },
      orderBy: { appointmentTime: 'asc' },
      include: { patient: { select: { firstName: true, lastName: true, gender: true } } },
      take: 5
    })
  ]);

  return {
    todayAppointments: todayAppts,
    totalPatients,
    pendingRequests: pendingPrescriptions,
    todaySchedule: schedule.map(s => ({
      id: s.id,
      patientName: `${s.patient.firstName} ${s.patient.lastName}`,
      time: s.appointmentTime,
      type: s.type,
      status: s.status
    }))
  };
};

const getPatientStats = async (actor) => {
  const hospitalId = actor.hospitalId;
  const patient = await prisma.patientProfile.findFirst({ where: { userId: actor.id, hospitalId } });
  if (!patient) return null;

  const [
    totalAppts,
    upcomingAppts,
    totalPrescriptions,
    recentAppts,
    recentPrescriptions
  ] = await Promise.all([
    prisma.appointment.count({ where: { patientId: patient.id } }),
    prisma.appointment.count({ where: { patientId: patient.id, appointmentDate: { gte: new Date() }, status: 'SCHEDULED' } }),
    prisma.prescription.count({ where: { patientId: patient.id } }),
    prisma.appointment.findMany({
      where: { patientId: patient.id },
      orderBy: { appointmentDate: 'desc' },
      include: { doctor: { include: { user: { select: { firstName: true, lastName: true } } } } },
      take: 3
    }),
    prisma.prescription.findMany({
      where: { patientId: patient.id },
      orderBy: { createdAt: 'desc' },
      include: { doctor: { include: { user: { select: { firstName: true, lastName: true } } } } },
      take: 3
    })
  ]);

  return {
    totalAppointments: totalAppts,
    upcomingAppointments: upcomingAppts,
    prescriptions: totalPrescriptions,
    pendingPayments: await prisma.invoice.count({ where: { patientId: patient.id, status: { in: ['ISSUED', 'PARTIALLY_PAID'] } } }),
    recentAppointments: recentAppts.map(a => ({
      id: a.id,
      doctorName: `Dr. ${a.doctor.user.firstName} ${a.doctor.user.lastName}`,
      date: a.appointmentDate,
      time: a.appointmentTime,
      status: a.status
    })),
    recentPrescriptions: recentPrescriptions.map(p => ({
      id: p.id,
      doctorName: `Dr. ${p.doctor.user.firstName} ${p.doctor.user.lastName}`,
      date: p.createdAt,
      items: 0 // Count items if needed
    })),
    profile: {
      bloodGroup: patient.bloodGroup,
      gender: patient.gender,
      dob: patient.dateOfBirth,
      phone: patient.phone
    }
  };
};

const getPharmacistStats = async (actor) => {
  const hospitalId = actor.hospitalId;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [
    totalMeds,
    lowStock,
    dispensedToday,
    revenue
  ] = await Promise.all([
    prisma.medicine.count({ where: { hospitalId, isActive: true } }),
    prisma.medicine.count({ where: { hospitalId, currentStock: { lte: 10 }, isActive: true } }),
    prisma.pharmacyDispensing.count({ where: { hospitalId, dispensedAt: { gte: today } } }),
    prisma.payment.findMany({
      where: { 
        hospitalId, 
        createdAt: { gte: today },
        invoice: { type: 'PHARMACY' },
        status: 'SUCCESS'
      },
      select: { amount: true }
    }).then(payments => payments.reduce((sum, p) => sum + Number(p.amount), 0))
  ]);

  return {
    totalMedicines: totalMeds,
    lowStockCount: lowStock,
    todayDispensed: dispensedToday,
    todayRevenue: revenue || 0,
    alerts: {
      lowStock: lowStock,
      expiringSoon: await prisma.medicineBatch.count({ where: { hospitalId, expiryDate: { lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) } } })
    }
  };
};

const getReceptionistStats = async (actor) => {
  const hospitalId = actor.hospitalId;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [
    todayAppts,
    newPatients,
    pendingAppts,
    recentAppts
  ] = await Promise.all([
    prisma.appointment.count({ where: { hospitalId, appointmentDate: today, status: { notIn: ['CANCELLED', 'NO_SHOW'] } } }),
    prisma.patientProfile.count({ where: { hospitalId, createdAt: { gte: today } } }),
    prisma.appointment.count({ where: { hospitalId, status: 'SCHEDULED' } }),
    prisma.appointment.findMany({
      where: { hospitalId, appointmentDate: today },
      orderBy: { appointmentTime: 'asc' },
      include: { 
        patient: { select: { firstName: true, lastName: true } },
        doctor: { include: { user: { select: { firstName: true, lastName: true } } } }
      },
      take: 10
    })
  ]);

  return {
    todayAppointments: todayAppts,
    walkInRegistrations: newPatients,
    pendingAppointments: pendingAppts,
    appointments: recentAppts.map(a => ({
      id: a.id,
      time: a.appointmentTime,
      patient: `${a.patient.firstName} ${a.patient.lastName}`,
      doctor: `Dr. ${a.doctor.user.firstName} ${a.doctor.user.lastName}`,
      status: a.status
    }))
  };
};

const getNurseStats = async (actor) => {
  const hospitalId = actor.hospitalId;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [
    vitalsPending,
    activeAdmissions,
    todayLabCollections
  ] = await Promise.all([
    prisma.appointment.count({ where: { hospitalId, appointmentDate: today, status: 'CONFIRMED' } }),
    prisma.ipdAdmission.count({ where: { hospitalId, status: 'ADMITTED' } }),
    prisma.labOrder.count({ where: { hospitalId, status: 'ORDERED' } })
  ]);

  return {
    vitalsPending,
    activeAdmissions,
    todayLabCollections
  };
};

const getSuperAdminStats = async () => {
  const [
    totalHospitals,
    totalUsers,
    totalRevenue
  ] = await Promise.all([
    prisma.hospital.count(),
    prisma.user.count(),
    prisma.payment.aggregate({
      where: { status: 'SUCCESS' },
      _sum: { amount: true }
    })
  ]);

  return {
    totalHospitals,
    totalUsers,
    totalRevenue: totalRevenue._sum.amount || 0,
    planDistribution: [
      { name: 'Trial', value: 0 },
      { name: 'Basic', value: 0 },
      { name: 'Standard', value: totalHospitals },
      { name: 'Premium', value: 0 },
    ],
    revenueTrend: [
      { month: 'Apr', revenue: totalRevenue._sum.amount || 0 }
    ]
  };
};

module.exports = {
  getAdminStats,
  getDoctorStats,
  getPatientStats,
  getPharmacistStats,
  getReceptionistStats,
  getNurseStats,
  getSuperAdminStats,
};

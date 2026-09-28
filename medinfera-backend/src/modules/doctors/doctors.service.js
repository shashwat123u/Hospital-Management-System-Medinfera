const prisma = require('../../config/database');
const AppError = require('../../utils/AppError');
const { getPagination, paginationMeta } = require('../../utils/pagination');

const create = async (data, actor) => {
  const hospitalId = actor.hospitalId;
  let userId = data.userId;

  // If no userId provided, create a new user with DOCTOR role
  if (!userId) {
    if (!data.email || !data.firstName || !data.lastName) {
      throw AppError.badRequest('Email, firstName, and lastName are required when creating a new doctor');
    }

    // Check if user already exists
    let existingUser = await prisma.user.findFirst({
      where: { email: data.email.toLowerCase(), hospitalId, deletedAt: null }
    });

    if (existingUser) {
      // Check if doctor profile already exists
      const existingProfile = await prisma.doctorProfile.findUnique({ where: { userId: existingUser.id } });
      if (existingProfile) {
        throw AppError.conflict('A doctor profile already exists for this user');
      }
      userId = existingUser.id;
    } else {
      // Create new user
      const bcrypt = require('bcryptjs');
      const defaultPassword = 'Doctor@123';
      const passwordHash = await bcrypt.hash(defaultPassword, 12);

      const newUser = await prisma.user.create({
        data: {
          email: data.email.toLowerCase(),
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone || null,
          passwordHash,
          role: 'DOCTOR',
          hospitalId,
          isActive: true,
        }
      });
      userId = newUser.id;
    }
  } else {
    // Verify existing user
    const user = await prisma.user.findFirst({
      where: { id: userId, hospitalId, role: 'DOCTOR', deletedAt: null },
    });
    if (!user) throw AppError.notFound('Doctor user not found in this hospital');

    const existing = await prisma.doctorProfile.findUnique({ where: { userId } });
    if (existing) throw AppError.conflict('Doctor profile already exists for this user');
  }

  // Create doctor profile
  const profileData = {
    userId,
    hospitalId,
    specialization: data.specialization,
    qualification: data.qualification || null,
    licenseNumber: data.licenseNumber || null,
    experienceYears: data.experienceYears || 0,
    consultationFee: data.consultationFee || 0,
    followUpFee: data.followUpFee || 0,
    emergencyFee: data.emergencyFee || 0,
    maxDailyPatients: data.maxDailyPatients || 30,
    biography: data.biography || null,
  };

  return prisma.doctorProfile.create({
    data: profileData,
    include: { user: { select: { firstName: true, lastName: true, email: true, phone: true } } },
  });
};

const findAll = async (query, actor) => {
  const { page, limit, skip, take } = getPagination(query);
  const hospitalId = actor.hospitalId;

  const where = { hospitalId };
  if (query.specialization) where.specialization = { contains: query.specialization, mode: 'insensitive' };
  if (query.isAvailable !== undefined) where.isAvailable = query.isAvailable === 'true';
  if (query.search) {
    where.OR = [
      { specialization: { contains: query.search, mode: 'insensitive' } },
      { user: { firstName: { contains: query.search, mode: 'insensitive' } } },
      { user: { lastName: { contains: query.search, mode: 'insensitive' } } },
    ];
  }

  const [data, total] = await Promise.all([
    prisma.doctorProfile.findMany({
      where, skip, take,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { firstName: true, lastName: true, email: true, phone: true, avatarUrl: true } },
        schedules: { where: { isActive: true } },
      },
    }),
    prisma.doctorProfile.count({ where }),
  ]);

  return { data, pagination: paginationMeta(total, page, limit) };
};

const findById = async (id, actor) => {
  const doctor = await prisma.doctorProfile.findFirst({
    where: { id, hospitalId: actor.hospitalId },
    include: {
      user: { select: { firstName: true, lastName: true, email: true, phone: true, avatarUrl: true } },
      schedules: { orderBy: { dayOfWeek: 'asc' } },
      leaves: { where: { leaveDate: { gte: new Date() } }, orderBy: { leaveDate: 'asc' } },
    },
  });
  if (!doctor) throw AppError.notFound('Doctor not found');
  return doctor;
};

const update = async (id, data, actor) => {
  const doctor = await findById(id, actor);
  return prisma.doctorProfile.update({ where: { id }, data });
};

const upsertSchedule = async (doctorId, data, actor) => {
  await findById(doctorId, actor);
  return prisma.doctorSchedule.upsert({
    where: { doctorId_dayOfWeek_startTime: { doctorId, dayOfWeek: data.dayOfWeek, startTime: data.startTime } },
    create: { ...data, doctorId, hospitalId: actor.hospitalId },
    update: { endTime: data.endTime, slotDurationMinutes: data.slotDurationMinutes, maxSlots: data.maxSlots, isActive: data.isActive },
  });
};

const deleteSchedule = async (doctorId, scheduleId, actor) => {
  await findById(doctorId, actor);
  const schedule = await prisma.doctorSchedule.findFirst({ where: { id: scheduleId, doctorId } });
  if (!schedule) throw AppError.notFound('Schedule not found');
  return prisma.doctorSchedule.update({ where: { id: scheduleId }, data: { isActive: false } });
};

const addLeave = async (doctorId, data, actor) => {
  await findById(doctorId, actor);
  return prisma.doctorLeave.create({
    data: { ...data, doctorId, hospitalId: actor.hospitalId, approvedBy: actor.id },
  });
};

const removeLeave = async (doctorId, leaveId, actor) => {
  await findById(doctorId, actor);
  const leave = await prisma.doctorLeave.findFirst({ where: { id: leaveId, doctorId } });
  if (!leave) throw AppError.notFound('Leave not found');
  return prisma.doctorLeave.delete({ where: { id: leaveId } });
};

const getDashboard = async (doctorId, actor) => {
  await findById(doctorId, actor);
  const hospitalId = actor.hospitalId;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [todayAppts, pendingAppts, totalPatients, activeAdmissions] = await Promise.all([
    prisma.appointment.count({
      where: { doctorId, hospitalId, appointmentDate: { gte: today, lt: tomorrow }, status: { notIn: ['CANCELLED'] } },
    }),
    prisma.appointment.count({
      where: { doctorId, hospitalId, status: { in: ['SCHEDULED', 'CONFIRMED'] }, appointmentDate: { gte: today } },
    }),
    prisma.appointment.groupBy({
      by: ['patientId'],
      where: { doctorId, hospitalId },
      _count: true,
    }).then(r => r.length),
    prisma.ipdAdmission.count({
      where: { primaryDoctorId: doctorId, hospitalId, status: { notIn: ['DISCHARGED', 'DECEASED', 'TRANSFERRED'] } },
    }),
  ]);

  return { todayAppointments: todayAppts, pendingAppointments: pendingAppts, totalPatients, activeAdmissions };
};

module.exports = { create, findAll, findById, update, upsertSchedule, deleteSchedule, addLeave, removeLeave, getDashboard };

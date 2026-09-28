const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // 1. Create Default Hospital
  const hospital = await prisma.hospital.upsert({
    where: { code: 'MED001' },
    update: {},
    create: {
      name: 'MedInfera General Hospital',
      code: 'MED001',
      slug: 'medinfera-general',
      address: '123 Medical Drive, Health City',
      city: 'Mumbai',
      state: 'Maharashtra',
      country: 'India',
      pincode: '400001',
      email: 'contact@medinfera.com',
      phone: '+91 22 1234 5678',
    },
  });

  console.log('Hospital created:', hospital.name);

  const roles = [
    { role: 'SUPER_ADMIN', email: 'superadmin@medinfera.com', firstName: 'Super', lastName: 'Admin' },
    { role: 'ADMIN', email: 'admin@medinfera.com', firstName: 'Hospital', lastName: 'Admin' },
    { role: 'DOCTOR', email: 'doctor@medinfera.com', firstName: 'John', lastName: 'Doe' },
    { role: 'PATIENT', email: 'patient@medinfera.com', firstName: 'Jane', lastName: 'Smith' },
    { role: 'PHARMACIST', email: 'pharmacist@medinfera.com', firstName: 'Phil', lastName: 'Pharmacy' },
    { role: 'STAFF', email: 'staff@medinfera.com', firstName: 'Sarah', lastName: 'Staff' },
  ];

  // Use .env password for SUPER_ADMIN, fallback for others
  const dotenv = require('dotenv');
  dotenv.config({ path: require('path').resolve(__dirname, '../.env') });

  const superAdminPassword = process.env.SUPER_ADMIN_PASSWORD || 'Password@123';

  // Pre-hash passwords for each role
  const passwordHashes = {};
  for (const userDef of roles) {
    if (userDef.role === 'SUPER_ADMIN') {
      passwordHashes[userDef.role] = await bcrypt.hash(superAdminPassword, 12);
    } else {
      passwordHashes[userDef.role] = await bcrypt.hash('Password@123', 12);
    }
  }


  for (const userDef of roles) {
    const targetHospitalId = userDef.role === 'SUPER_ADMIN' ? null : hospital.id;
    const passwordHash = passwordHashes[userDef.role];

    let user = await prisma.user.findFirst({
      where: {
        email: userDef.email,
        hospitalId: targetHospitalId,
      },
    });

    if (user) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          passwordHash,
          role: userDef.role,
          isActive: true,
        },
      });
    } else {
      user = await prisma.user.create({
        data: {
          email: userDef.email,
          passwordHash,
          role: userDef.role,
          firstName: userDef.firstName,
          lastName: userDef.lastName,
          hospitalId: targetHospitalId,
          isActive: true,
        },
      });
    }

    console.log(`User created: ${user.email} (${user.role})`);

    // Create profile if needed
    if (user.role === 'DOCTOR') {
      await prisma.doctorProfile.upsert({
        where: { userId: user.id },
        update: {},
        create: {
          userId: user.id,
          hospitalId: hospital.id,
          specialization: 'General Medicine',
          licenseNumber: 'DOC12345',
          consultationFee: 500,
        },
      });
      console.log(`Doctor profile created for ${user.email}`);
    }

    if (user.role === 'PATIENT') {
      await prisma.patientProfile.upsert({
        where: { patientCode_hospitalId: { patientCode: 'PAT001', hospitalId: hospital.id } },
        update: { userId: user.id },
        create: {
          userId: user.id,
          hospitalId: hospital.id,
          patientCode: 'PAT001',
          firstName: user.firstName,
          lastName: user.lastName,
          gender: 'FEMALE',
          phone: '9876543210',
        },
      });
      console.log(`Patient profile created for ${user.email}`);
    }
  }

  console.log('Seed completed successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

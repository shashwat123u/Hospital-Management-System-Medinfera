const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('Starting medicine seed...');

  // Get the first hospital
  const hospital = await prisma.hospital.findFirst();
  if (!hospital) {
    console.error('No hospital found. Please run the main seed first.');
    return;
  }

  const medicines = [
    {
      name: 'Paracetamol 500mg',
      genericName: 'Acetaminophen',
      category: 'TABLET',
      manufacturer: 'Cipla Ltd',
      unitOfMeasure: 'strip (10 tabs)',
      reorderLevel: 50,
      currentStock: 120,
      sellingPrice: 15.00,
      mrp: 20.00
    },
    {
      name: 'Amoxicillin 250mg',
      genericName: 'Amoxicillin',
      category: 'CAPSULE',
      manufacturer: 'Sun Pharma',
      unitOfMeasure: 'strip (10 caps)',
      reorderLevel: 30,
      currentStock: 85,
      sellingPrice: 55.00,
      mrp: 65.00
    },
    {
      name: 'Corex Cough Syrup',
      genericName: 'Chlorpheniramine Maleate',
      category: 'SYRUP',
      manufacturer: 'Pfizer',
      unitOfMeasure: 'bottle (100ml)',
      reorderLevel: 20,
      currentStock: 15, // Low stock to trigger alert
      sellingPrice: 110.00,
      mrp: 125.00
    },
    {
      name: 'Pantoprazole 40mg',
      genericName: 'Pantoprazole Sodium',
      category: 'TABLET',
      manufacturer: 'Alkem Labs',
      unitOfMeasure: 'strip (15 tabs)',
      reorderLevel: 40,
      currentStock: 200,
      sellingPrice: 85.00,
      mrp: 95.00
    },
    {
      name: 'Ceftriaxone 1g Injection',
      genericName: 'Ceftriaxone Sodium',
      category: 'INJECTION',
      manufacturer: 'Mankind Pharma',
      unitOfMeasure: 'vial',
      reorderLevel: 50,
      currentStock: 45, // Low stock to trigger alert
      sellingPrice: 45.00,
      mrp: 60.00
    },
    {
      name: 'Aspirin 75mg',
      genericName: 'Acetylsalicylic Acid',
      category: 'TABLET',
      manufacturer: 'Bayer',
      unitOfMeasure: 'strip (14 tabs)',
      reorderLevel: 30,
      currentStock: 110,
      sellingPrice: 12.00,
      mrp: 15.00
    },
    {
      name: 'Insulin Glargine',
      genericName: 'Insulin',
      category: 'INJECTION',
      manufacturer: 'Sanofi',
      unitOfMeasure: 'pen (3ml)',
      reorderLevel: 10,
      currentStock: 8, // Low stock to trigger alert
      sellingPrice: 850.00,
      mrp: 920.00
    }
  ];

  for (const med of medicines) {
    await prisma.medicine.upsert({
      where: {
        name_genericName_hospitalId: {
          name: med.name,
          genericName: med.genericName,
          hospitalId: hospital.id
        }
      },
      update: med,
      create: {
        ...med,
        hospitalId: hospital.id
      }
    });
    console.log(`Upserted medicine: ${med.name}`);
  }

  console.log('Medicine seed completed successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

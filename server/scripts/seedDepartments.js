import { connectDatabase, disconnectDatabase } from '../config/db.js';
import Department from '../models/Department.js';

const departments = [
  {
    name: 'UI/UX',
    code: 'UI_UX',
    description: 'Designs intuitive, accessible user experiences and maintains the organization’s design standards.',
  },
  {
    name: 'Web Development',
    code: 'WEB_DEV',
    description: 'Builds and maintains web applications, services, and integrations.',
  },
  {
    name: 'Mobile Development',
    code: 'MOBILE',
    description: 'Builds and maintains mobile applications and related services.',
  },
  {
    name: 'Hardware',
    code: 'HARDWARE',
    description: 'Develops, tests, and supports hardware systems and prototypes.',
  },
  {
    name: 'Quality Assurance',
    code: 'QA_TESTING',
    description: 'Validates product quality through testing, verification, and release support.',
  },
  {
    name: 'DevOps / Infrastructure',
    code: 'DEVOPS',
    description: 'Operates deployment systems, infrastructure, reliability, and monitoring.',
  },
  {
    name: 'Research & Development',
    code: 'R_AND_D',
    description: 'Explores technical opportunities and develops research into practical outcomes.',
  },
  {
    name: 'Product / Project Management',
    code: 'PRODUCT',
    description: 'Coordinates product direction, project planning, priorities, and delivery.',
  },
  {
    name: 'Marketing / Social Media',
    code: 'MARKETING',
    description: 'Manages marketing communications, social channels, and audience engagement.',
  },
  {
    name: 'Business / Client Relations',
    code: 'BUSINESS',
    description: 'Coordinates business development, client relationships, and partnerships.',
  },
];

async function seedDepartments() {
  let created = 0;
  let existing = 0;

  try {
    await connectDatabase();

    for (const department of departments) {
      const result = await Department.updateOne(
        { code: department.code },
        {
          $set: {
            name: department.name,
            description: department.description,
            status: 'Active',
            isActive: true,
          },
          $setOnInsert: {
            code: department.code,
            lead: null,
            members: [],
          },
        },
        { upsert: true, runValidators: true },
      );

      if (result.upsertedCount) {
        created += 1;
        console.info(`[departments] Created ${department.name} (${department.code}).`);
      } else {
        existing += 1;
        console.info(`[departments] Updated existing ${department.name} (${department.code}); leadership and members preserved.`);
      }
    }

    console.info(`[departments] Complete: created=${created}, already existed=${existing}.`);
  } finally {
    await disconnectDatabase();
  }
}

seedDepartments().catch((error) => {
  console.error('[departments] Seed failed:', error);
  process.exitCode = 1;
});

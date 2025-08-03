import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Hash passwords for users
  const adminPassword = await bcrypt.hash('admin123', 10);
  const userPassword = await bcrypt.hash('user123', 10);

  // Create admin user - Zouhair Ouddach
  const adminUser = await prisma.user.upsert({
    where: { email: 'zogamaouddach@gmail.com' },
    update: {},
    create: {
      email: 'zogamaouddach@gmail.com',
      name: 'Zouhair Ouddach',
      password: adminPassword,
      role: 'ADMIN',
      status: 'APPROVED',
      email_verified: true,
      created_at: new Date(),
      updated_at: new Date(),
    },
  });

  console.log('✅ Admin user created:', {
    id: adminUser.id,
    email: adminUser.email,
    name: adminUser.name,
    role: adminUser.role,
    status: adminUser.status,
    email_verified: adminUser.email_verified,
  });

  // Create test startup user - Sarah Johnson
  const startupUser = await prisma.user.upsert({
    where: { email: 'sarah@ecotech-solutions.com' },
    update: {},
    create: {
      email: 'sarah@ecotech-solutions.com',
      name: 'Sarah Johnson',
      password: userPassword,
      role: 'STARTUP',
      status: 'APPROVED',
      email_verified: true,
      created_at: new Date('2023-03-15'),
      updated_at: new Date(),
    },
  });

  console.log('✅ Test startup user created:', {
    id: startupUser.id,
    email: startupUser.email,
    name: startupUser.name,
    role: startupUser.role,
    status: startupUser.status,
  });

  // Create a realistic startup for Sarah
  const startup = await prisma.startup.upsert({
    where: { user_id: startupUser.id },
    update: {},
    create: {
      user_id: startupUser.id,
      company_name: 'EcoTech Solutions',
      description: 'Innovative IoT solutions for sustainable agriculture and environmental monitoring. We develop smart sensors and data analytics platforms to help farmers optimize resource usage and reduce environmental impact.',
      industry: 'AgTech',
      founded_year: 2023,
      team_size: '3-5',
      website: 'https://ecotech-solutions.com',
      status: 'APPROVED',
      approved_by: adminUser.id,
      approved_at: new Date('2023-04-01'),
      created_at: new Date('2023-03-15'),
      updated_at: new Date(),
    },
  });

  console.log('✅ Test startup created:', {
    id: startup.id,
    company_name: startup.company_name,
    industry: startup.industry,
    status: startup.status,
  });

  // Create budget for EcoTech Solutions
  const budget = await prisma.startupBudget.upsert({
    where: { startup_id: startup.id },
    update: {},
    create: {
      startup_id: startup.id,
      total_budget: 75000,
      used_budget: 18500,
      remaining_budget: 56500,
      created_at: new Date('2023-04-01'),
      updated_at: new Date(),
    },
  });

  console.log('✅ Startup budget created:', {
    id: budget.id,
    total_budget: budget.total_budget,
    used_budget: budget.used_budget,
    remaining_budget: budget.remaining_budget,
  });

  // Create realistic budget categories for EcoTech Solutions
  const categories = [
    { 
      name: 'Cloud Services', 
      budget_allocated: 15000, 
      budget_used: 3200, 
      color: '#3B82F6',
      description: 'AWS/Azure hosting, databases, and cloud infrastructure'
    },
    { 
      name: 'Marketing', 
      budget_allocated: 12000, 
      budget_used: 4800, 
      color: '#10B981',
      description: 'Digital marketing, social media, and content creation'
    },
    { 
      name: 'IT Tools', 
      budget_allocated: 8000, 
      budget_used: 2100, 
      color: '#8B5CF6',
      description: 'Development tools, software licenses, and productivity apps'
    },
    { 
      name: 'Events', 
      budget_allocated: 10000, 
      budget_used: 2500, 
      color: '#F59E0B',
      description: 'Conference attendance, networking events, and trade shows'
    },
    { 
      name: 'Freelances', 
      budget_allocated: 20000, 
      budget_used: 5400, 
      color: '#EF4444',
      description: 'External developers, designers, and specialized consultants'
    },
    { 
      name: 'Training', 
      budget_allocated: 10000, 
      budget_used: 500, 
      color: '#06B6D4',
      description: 'Online courses, certifications, and professional development'
    },
  ];

  for (const category of categories) {
    await prisma.budgetCategory.upsert({
      where: { 
        startup_id_name: {
          startup_id: startup.id,
          name: category.name
        }
      },
      update: {},
      create: {
        startup_id: startup.id,
        name: category.name,
        budget_allocated: category.budget_allocated,
        budget_used: category.budget_used,
        color: category.color,
        created_at: new Date('2023-04-01'),
        updated_at: new Date(),
      },
    });
  }

  console.log('✅ Budget categories created');

  // Create additional startup user - Mohamed Alami
  const startupUser2 = await prisma.user.upsert({
    where: { email: 'mohamed@fintech-morocco.com' },
    update: {},
    create: {
      email: 'mohamed@fintech-morocco.com',
      name: 'Mohamed Alami',
      password: userPassword,
      role: 'STARTUP',
      status: 'APPROVED',
      email_verified: true,
      created_at: new Date('2023-05-20'),
      updated_at: new Date(),
    },
  });

  // Create second startup - FinTech Morocco
  const startup2 = await prisma.startup.upsert({
    where: { user_id: startupUser2.id },
    update: {},
    create: {
      user_id: startupUser2.id,
      company_name: 'FinTech Morocco',
      description: 'Digital banking solutions for the Moroccan market. We provide mobile payment platforms and financial inclusion tools for underbanked populations.',
      industry: 'FinTech',
      founded_year: 2023,
      team_size: '5-10',
      website: 'https://fintech-morocco.com',
      status: 'APPROVED',
      approved_by: adminUser.id,
      approved_at: new Date('2023-06-01'),
      created_at: new Date('2023-05-20'),
      updated_at: new Date(),
    },
  });

  // Create budget for FinTech Morocco
  const budget2 = await prisma.startupBudget.upsert({
    where: { startup_id: startup2.id },
    update: {},
    create: {
      startup_id: startup2.id,
      total_budget: 100000,
      used_budget: 25000,
      remaining_budget: 75000,
      created_at: new Date('2023-06-01'),
      updated_at: new Date(),
    },
  });

  // Create budget categories for FinTech Morocco
  const categories2 = [
    { name: 'Cloud Services', budget_allocated: 25000, budget_used: 8000, color: '#3B82F6' },
    { name: 'Marketing', budget_allocated: 20000, budget_used: 6000, color: '#10B981' },
    { name: 'IT Tools', budget_allocated: 15000, budget_used: 4000, color: '#8B5CF6' },
    { name: 'Events', budget_allocated: 15000, budget_used: 3000, color: '#F59E0B' },
    { name: 'Freelances', budget_allocated: 20000, budget_used: 4000, color: '#EF4444' },
    { name: 'Training', budget_allocated: 5000, budget_used: 0, color: '#06B6D4' },
  ];

  for (const category of categories2) {
    await prisma.budgetCategory.upsert({
      where: { 
        startup_id_name: {
          startup_id: startup2.id,
          name: category.name
        }
      },
      update: {},
      create: {
        startup_id: startup2.id,
        name: category.name,
        budget_allocated: category.budget_allocated,
        budget_used: category.budget_used,
        color: category.color,
        created_at: new Date('2023-06-01'),
        updated_at: new Date(),
      },
    });
  }

  console.log('✅ Second startup and budget created');

  // Create some realistic budget requests
  const budgetRequests = [
    {
      startup_id: startup.id,
      user_id: startupUser.id,
      category: 'Cloud Services',
      description: 'AWS hosting costs for production environment scaling. Need additional EC2 instances and RDS database for increased user load.',
      amount: 2500,
      status: 'PENDING' as const,
      priority: 'HIGH' as const,
      submission_date: new Date('2023-06-15'),
    },
    {
      startup_id: startup.id,
      user_id: startupUser.id,
      category: 'Marketing',
      description: 'Google Ads campaign for customer acquisition. Target farmers and agricultural cooperatives in Morocco.',
      amount: 3000,
      status: 'APPROVED' as const,
      priority: 'MEDIUM' as const,
      submission_date: new Date('2023-06-01'),
      review_date: new Date('2023-06-03'),
      reviewed_by: adminUser.id,
      notes: 'Approved for Q2 marketing campaign. Good ROI potential in agricultural sector.',
    },
    {
      startup_id: startup2.id,
      user_id: startupUser2.id,
      category: 'Freelances',
      description: 'Mobile app developer for iOS native application. Need experienced developer for 3-month project.',
      amount: 15000,
      status: 'PENDING' as const,
      priority: 'HIGH' as const,
      submission_date: new Date('2023-06-10'),
    },
  ];

  for (const request of budgetRequests) {
    await prisma.budgetRequest.create({
      data: {
        ...request,
        created_at: new Date(),
        updated_at: new Date(),
      },
    });
  }

  console.log('✅ Budget requests created');

  // Create sample events
  const events = [
    {
      title: 'Startup Pitch Workshop',
      description: 'Learn how to create compelling pitches that capture investor attention and communicate your business value proposition effectively.',
      type: 'WORKSHOP' as const,
      status: 'UPCOMING' as const,
      date: new Date('2023-07-15'),
      time: '14:00',
      duration: '3 hours',
      location: 'BMAQ Innovation Center, Casablanca',
      max_attendees: 25,
      current_attendees: 0,
      registration_deadline: new Date('2023-07-10'),
      is_public: true,
      requires_approval: false,
      created_by: adminUser.id,
    },
    {
      title: 'AgTech Innovation Summit',
      description: 'Connect with AgTech startups, investors, and industry experts. Showcase your agricultural technology solutions.',
      type: 'CONFERENCE' as const,
      status: 'UPCOMING' as const,
      date: new Date('2023-08-20'),
      time: '09:00',
      duration: '8 hours',
      location: 'Mohammed V University, Rabat',
      max_attendees: 100,
      current_attendees: 0,
      registration_deadline: new Date('2023-08-15'),
      is_public: true,
      requires_approval: true,
      created_by: adminUser.id,
    },
  ];

  for (const event of events) {
    await prisma.event.create({
      data: {
        ...event,
        created_at: new Date(),
        updated_at: new Date(),
      },
    });
  }

  console.log('✅ Sample events created');

  // Create system settings
  const settings = [
    // General settings
    { key: 'site_name', value: 'BMAQ Innovation Hub', description: 'Platform name' },
    { key: 'support_email', value: 'support@bmaq.com', description: 'Support contact email' },
    { key: 'maintenance_mode', value: 'false', description: 'Enable maintenance mode' },
    { key: 'registration_enabled', value: 'true', description: 'Allow new registrations' },
    { key: 'default_budget', value: '75000', description: 'Default budget allocation for new startups' },
    { key: 'auto_approval', value: 'false', description: 'Auto-approve new startup registrations' },
    { key: 'max_budget_request', value: '20000', description: 'Maximum amount for a single budget request' },
    
    // File upload settings
    { key: 'max_file_size', value: '10', description: 'Maximum file size in MB' },
    { key: 'allowed_file_types', value: 'pdf,doc,docx,xls,xlsx,ppt,pptx,jpg,png', description: 'Allowed file types for uploads' },
    
    // Feature toggles
    { key: 'analytics_enabled', value: 'true', description: 'Enable analytics tracking' },
    { key: 'email_notifications', value: 'true', description: 'Enable email notifications' },
    
    // SMTP settings
    { key: 'smtp_server', value: 'smtp.bmaq.com', description: 'SMTP server hostname' },
    { key: 'smtp_port', value: '587', description: 'SMTP server port' },
    { key: 'smtp_username', value: 'admin@bmaq.com', description: 'SMTP username' },
    { key: 'smtp_password', value: '••••••••', description: 'SMTP password (masked)' },
  ];

  for (const setting of settings) {
    await prisma.systemSetting.upsert({
      where: { key: setting.key },
      update: {},
      create: {
        key: setting.key,
        value: setting.value,
        description: setting.description,
        created_at: new Date(),
        updated_at: new Date(),
      },
    });
  }

  console.log('✅ System settings created');

  // Create sample resources
  const resources = [
    {
      title: 'Business Plan Template for AgTech Startups',
      description: 'Comprehensive business plan template specifically designed for agricultural technology startups, including market analysis and financial projections.',
      category: 'BUSINESS_PLAN' as const,
      type: 'TEMPLATE' as const,
      file_url: '/resources/agtech-business-plan-template.pdf',
      file_size: '2.5MB',
      download_count: 0,
      is_public: true,
      uploaded_by: adminUser.id,
    },
    {
      title: 'Fundraising Guide for Moroccan Startups',
      description: 'Step-by-step guide to raising capital in Morocco, including investor contacts and legal requirements.',
      category: 'FINANCE' as const,
      type: 'GUIDE' as const,
      file_url: '/resources/fundraising-guide-morocco.pdf',
      file_size: '4.1MB',
      download_count: 0,
      is_public: true,
      uploaded_by: adminUser.id,
    },
    {
      title: 'Digital Marketing Playbook',
      description: 'Complete digital marketing strategy guide for startups, including social media, content marketing, and paid advertising.',
      category: 'MARKETING' as const,
      type: 'GUIDE' as const,
      file_url: '/resources/digital-marketing-playbook.pdf',
      file_size: '3.8MB',
      download_count: 0,
      is_public: true,
      uploaded_by: adminUser.id,
    },
  ];

  for (const resource of resources) {
    await prisma.resource.create({
      data: {
        ...resource,
        created_at: new Date(),
        updated_at: new Date(),
      },
    });
  }

  console.log('✅ Sample resources created');

  console.log('🎉 Database seeding completed successfully!');
  console.log(`
📊 Summary:
- Admin user: ${adminUser.email} (password: admin123)
- Startup users: 2 (password: user123)
- Startups: 2 (EcoTech Solutions, FinTech Morocco)
- Budget categories: 12 total
- Budget requests: 3
- Events: 2
- Resources: 3
- System settings: 7

🔐 Login Credentials:
- Admin: zogamaouddach@gmail.com / admin123
- EcoTech: sarah@ecotech-solutions.com / user123
- FinTech: mohamed@fintech-morocco.com / user123
  `);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Error during seeding:', e);
    await prisma.$disconnect();
    process.exit(1);
  }); 
"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var client_1 = require("@prisma/client");
var bcryptjs_1 = require("bcryptjs");
var prisma = new client_1.PrismaClient();
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var adminPassword, userPassword, adminUser, startupUser, startup, budget, categories, _i, categories_1, category, startupUser2, startup2, budget2, categories2, _a, categories2_1, category, budgetRequests, _b, budgetRequests_1, request, events, _c, events_1, event_1, settings, _d, settings_1, setting, resources, _e, resources_1, resource;
        return __generator(this, function (_f) {
            switch (_f.label) {
                case 0:
                    console.log('🌱 Starting database seeding...');
                    return [4 /*yield*/, bcryptjs_1.default.hash('admin123', 10)];
                case 1:
                    adminPassword = _f.sent();
                    return [4 /*yield*/, bcryptjs_1.default.hash('user123', 10)];
                case 2:
                    userPassword = _f.sent();
                    return [4 /*yield*/, prisma.user.upsert({
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
                        })];
                case 3:
                    adminUser = _f.sent();
                    console.log('✅ Admin user created:', {
                        id: adminUser.id,
                        email: adminUser.email,
                        name: adminUser.name,
                        role: adminUser.role,
                        status: adminUser.status,
                        email_verified: adminUser.email_verified,
                    });
                    return [4 /*yield*/, prisma.user.upsert({
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
                        })];
                case 4:
                    startupUser = _f.sent();
                    console.log('✅ Test startup user created:', {
                        id: startupUser.id,
                        email: startupUser.email,
                        name: startupUser.name,
                        role: startupUser.role,
                        status: startupUser.status,
                    });
                    return [4 /*yield*/, prisma.startup.upsert({
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
                        })];
                case 5:
                    startup = _f.sent();
                    console.log('✅ Test startup created:', {
                        id: startup.id,
                        company_name: startup.company_name,
                        industry: startup.industry,
                        status: startup.status,
                    });
                    return [4 /*yield*/, prisma.startupBudget.upsert({
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
                        })];
                case 6:
                    budget = _f.sent();
                    console.log('✅ Startup budget created:', {
                        id: budget.id,
                        total_budget: budget.total_budget,
                        used_budget: budget.used_budget,
                        remaining_budget: budget.remaining_budget,
                    });
                    categories = [
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
                    _i = 0, categories_1 = categories;
                    _f.label = 7;
                case 7:
                    if (!(_i < categories_1.length)) return [3 /*break*/, 10];
                    category = categories_1[_i];
                    return [4 /*yield*/, prisma.budgetCategory.upsert({
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
                        })];
                case 8:
                    _f.sent();
                    _f.label = 9;
                case 9:
                    _i++;
                    return [3 /*break*/, 7];
                case 10:
                    console.log('✅ Budget categories created');
                    return [4 /*yield*/, prisma.user.upsert({
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
                        })];
                case 11:
                    startupUser2 = _f.sent();
                    return [4 /*yield*/, prisma.startup.upsert({
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
                        })];
                case 12:
                    startup2 = _f.sent();
                    return [4 /*yield*/, prisma.startupBudget.upsert({
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
                        })];
                case 13:
                    budget2 = _f.sent();
                    categories2 = [
                        { name: 'Cloud Services', budget_allocated: 25000, budget_used: 8000, color: '#3B82F6' },
                        { name: 'Marketing', budget_allocated: 20000, budget_used: 6000, color: '#10B981' },
                        { name: 'IT Tools', budget_allocated: 15000, budget_used: 4000, color: '#8B5CF6' },
                        { name: 'Events', budget_allocated: 15000, budget_used: 3000, color: '#F59E0B' },
                        { name: 'Freelances', budget_allocated: 20000, budget_used: 4000, color: '#EF4444' },
                        { name: 'Training', budget_allocated: 5000, budget_used: 0, color: '#06B6D4' },
                    ];
                    _a = 0, categories2_1 = categories2;
                    _f.label = 14;
                case 14:
                    if (!(_a < categories2_1.length)) return [3 /*break*/, 17];
                    category = categories2_1[_a];
                    return [4 /*yield*/, prisma.budgetCategory.upsert({
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
                        })];
                case 15:
                    _f.sent();
                    _f.label = 16;
                case 16:
                    _a++;
                    return [3 /*break*/, 14];
                case 17:
                    console.log('✅ Second startup and budget created');
                    budgetRequests = [
                        {
                            startup_id: startup.id,
                            user_id: startupUser.id,
                            category: 'Cloud Services',
                            description: 'AWS hosting costs for production environment scaling. Need additional EC2 instances and RDS database for increased user load.',
                            amount: 2500,
                            status: 'PENDING',
                            priority: 'HIGH',
                            submission_date: new Date('2023-06-15'),
                        },
                        {
                            startup_id: startup.id,
                            user_id: startupUser.id,
                            category: 'Marketing',
                            description: 'Google Ads campaign for customer acquisition. Target farmers and agricultural cooperatives in Morocco.',
                            amount: 3000,
                            status: 'APPROVED',
                            priority: 'MEDIUM',
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
                            status: 'PENDING',
                            priority: 'HIGH',
                            submission_date: new Date('2023-06-10'),
                        },
                    ];
                    _b = 0, budgetRequests_1 = budgetRequests;
                    _f.label = 18;
                case 18:
                    if (!(_b < budgetRequests_1.length)) return [3 /*break*/, 21];
                    request = budgetRequests_1[_b];
                    return [4 /*yield*/, prisma.budgetRequest.create({
                            data: __assign(__assign({}, request), { created_at: new Date(), updated_at: new Date() }),
                        })];
                case 19:
                    _f.sent();
                    _f.label = 20;
                case 20:
                    _b++;
                    return [3 /*break*/, 18];
                case 21:
                    console.log('✅ Budget requests created');
                    events = [
                        {
                            title: 'Startup Pitch Workshop',
                            description: 'Learn how to create compelling pitches that capture investor attention and communicate your business value proposition effectively.',
                            type: 'WORKSHOP',
                            status: 'UPCOMING',
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
                            type: 'CONFERENCE',
                            status: 'UPCOMING',
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
                    _c = 0, events_1 = events;
                    _f.label = 22;
                case 22:
                    if (!(_c < events_1.length)) return [3 /*break*/, 25];
                    event_1 = events_1[_c];
                    return [4 /*yield*/, prisma.event.create({
                            data: __assign(__assign({}, event_1), { created_at: new Date(), updated_at: new Date() }),
                        })];
                case 23:
                    _f.sent();
                    _f.label = 24;
                case 24:
                    _c++;
                    return [3 /*break*/, 22];
                case 25:
                    console.log('✅ Sample events created');
                    settings = [
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
                    _d = 0, settings_1 = settings;
                    _f.label = 26;
                case 26:
                    if (!(_d < settings_1.length)) return [3 /*break*/, 29];
                    setting = settings_1[_d];
                    return [4 /*yield*/, prisma.systemSetting.upsert({
                            where: { key: setting.key },
                            update: {},
                            create: {
                                key: setting.key,
                                value: setting.value,
                                description: setting.description,
                                created_at: new Date(),
                                updated_at: new Date(),
                            },
                        })];
                case 27:
                    _f.sent();
                    _f.label = 28;
                case 28:
                    _d++;
                    return [3 /*break*/, 26];
                case 29:
                    console.log('✅ System settings created');
                    resources = [
                        {
                            title: 'Business Plan Template for AgTech Startups',
                            description: 'Comprehensive business plan template specifically designed for agricultural technology startups, including market analysis and financial projections.',
                            category: 'BUSINESS_PLAN',
                            type: 'TEMPLATE',
                            file_url: '/resources/agtech-business-plan-template.pdf',
                            file_size: '2.5MB',
                            download_count: 0,
                            is_public: true,
                            uploaded_by: adminUser.id,
                        },
                        {
                            title: 'Fundraising Guide for Moroccan Startups',
                            description: 'Step-by-step guide to raising capital in Morocco, including investor contacts and legal requirements.',
                            category: 'FINANCE',
                            type: 'GUIDE',
                            file_url: '/resources/fundraising-guide-morocco.pdf',
                            file_size: '4.1MB',
                            download_count: 0,
                            is_public: true,
                            uploaded_by: adminUser.id,
                        },
                        {
                            title: 'Digital Marketing Playbook',
                            description: 'Complete digital marketing strategy guide for startups, including social media, content marketing, and paid advertising.',
                            category: 'MARKETING',
                            type: 'GUIDE',
                            file_url: '/resources/digital-marketing-playbook.pdf',
                            file_size: '3.8MB',
                            download_count: 0,
                            is_public: true,
                            uploaded_by: adminUser.id,
                        },
                    ];
                    _e = 0, resources_1 = resources;
                    _f.label = 30;
                case 30:
                    if (!(_e < resources_1.length)) return [3 /*break*/, 33];
                    resource = resources_1[_e];
                    return [4 /*yield*/, prisma.resource.create({
                            data: __assign(__assign({}, resource), { created_at: new Date(), updated_at: new Date() }),
                        })];
                case 31:
                    _f.sent();
                    _f.label = 32;
                case 32:
                    _e++;
                    return [3 /*break*/, 30];
                case 33:
                    console.log('✅ Sample resources created');
                    console.log('🎉 Database seeding completed successfully!');
                    console.log("\n\uD83D\uDCCA Summary:\n- Admin user: ".concat(adminUser.email, " (password: admin123)\n- Startup users: 2 (password: user123)\n- Startups: 2 (EcoTech Solutions, FinTech Morocco)\n- Budget categories: 12 total\n- Budget requests: 3\n- Events: 2\n- Resources: 3\n- System settings: 7\n\n\uD83D\uDD10 Login Credentials:\n- Admin: zogamaouddach@gmail.com / admin123\n- EcoTech: sarah@ecotech-solutions.com / user123\n- FinTech: mohamed@fintech-morocco.com / user123\n  "));
                    return [2 /*return*/];
            }
        });
    });
}
main()
    .then(function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, prisma.$disconnect()];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); })
    .catch(function (e) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                console.error('❌ Error during seeding:', e);
                return [4 /*yield*/, prisma.$disconnect()];
            case 1:
                _a.sent();
                process.exit(1);
                return [2 /*return*/];
        }
    });
}); });

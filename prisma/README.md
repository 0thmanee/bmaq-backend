# BMAQ Prisma Database Schema

This directory contains the comprehensive Prisma schema for the BMAQ (Startup Incubator) platform.

## 📋 Schema Overview

The schema includes all the models needed for the BMAQ platform:

### Core Entities
- **User** - User accounts with roles (admin/startup)
- **Startup** - Startup company information
- **StartupBudget** - Budget allocation and tracking
- **BudgetCategory** - Individual budget categories per startup

### Budget Management
- **BudgetRequest** - Budget requests from startups
- **RequestAttachment** - File attachments for requests

### Event Management
- **Event** - Platform events and workshops
- **EventAttendee** - Event registration and attendance

### Resource Management
- **Resource** - Educational resources and files
- **ResourceTag** - Tagging system for resources
- **ResourceDownload** - Download tracking

### Suivi (Follow-up) Forms
- **SuiviForm** - Dynamic questionnaire forms
- **SuiviQuestion** - Individual questions in forms
- **QuestionOption** - Multiple choice options
- **SuiviTarget** - Targeting specific startups
- **SuiviResponse** - Form responses
- **SuiviAnswer** - Individual question answers

### System Management
- **SystemSetting** - Application configuration
- **AdminUser** - Admin user management

### Authentication (NextAuth)
- **Account** - OAuth account linking
- **Session** - User sessions
- **VerificationToken** - Email verification

## 🚀 Setup Instructions

### 1. Install Dependencies
```bash
npm install prisma @prisma/client
```

### 2. Environment Variables
Create a `.env` file in the project root with:
```env
DATABASE_URL="postgresql://username:password@host:port/database"
```

For Supabase, use your Supabase connection string:
```env
DATABASE_URL="postgresql://postgres:[password]@[host]:6543/postgres?pgbouncer=true&connection_limit=1"
```

### 3. Generate Prisma Client
```bash
npx prisma generate
```

### 4. Database Migration
```bash
# Create and apply migrations
npx prisma migrate dev --name init

# Or if database already exists, push schema
npx prisma db push
```

### 5. Prisma Studio (Optional)
```bash
npx prisma studio
```

## 📊 Key Features

### Relationships
- **One-to-One**: User ↔ Startup, Startup ↔ StartupBudget
- **One-to-Many**: User → BudgetRequests, Startup → BudgetCategories
- **Many-to-Many**: Events ↔ Users (via EventAttendee)

### Data Types
- **Decimal**: Financial amounts with precision (12,2)
- **DateTime**: Timestamps with timezone support
- **Enums**: Type-safe status and category values
- **Text**: Large text fields for descriptions

### Constraints
- **Unique**: Email addresses, startup per user
- **Cascade Delete**: Maintains referential integrity
- **Default Values**: Sensible defaults for status fields

## 🔧 Usage in Code

```typescript
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Example: Get startup with budget
const startup = await prisma.startup.findUnique({
  where: { id: 'startup-id' },
  include: {
    user: true,
    budget: true,
    budget_categories: true,
    budget_requests: {
      where: { status: 'PENDING' }
    }
  }
})
```

## 🎯 Type Integration

This schema perfectly matches the TypeScript types defined in `/types/types.ts`, ensuring full type safety across your application.

## 📝 Migration Notes

- All monetary values use `Decimal` type for precision
- Timestamps include both `created_at` and `updated_at`
- Soft delete pattern can be implemented by adding `deleted_at` fields
- Indexes are automatically created for foreign keys and unique constraints

## 🛠️ Maintenance

- Run `prisma generate` after schema changes
- Use `prisma migrate dev` for development migrations
- Use `prisma migrate deploy` for production deployments
- Keep this README updated with schema changes 
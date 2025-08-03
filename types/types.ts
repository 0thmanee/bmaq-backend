// =================================
// Core Entity Types
// =================================

export interface User {
  id: string;
  email: string;
  name?: string;
  role: 'admin' | 'startup';
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
  email_verified: boolean;
  verification_token?: string;
}

export interface Startup {
  id: string;
  user_id: string;
  company_name: string;
  description?: string;
  industry?: string;
  founded_year?: number;
  team_size?: string | number;
  website?: string;
  logo_url?: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
  approved_by?: string;
  approved_at?: string;
  rejection_reason?: string;
  user?: User;
  budget?: StartupBudget;
}

export interface StartupBudget {
  id?: string;
  startup_id?: string;
  total_budget: number;
  used_budget: number;
  remaining_budget: number;
  created_at?: string;
  updated_at?: string;
}

export interface BudgetCategory {
  id?: string;
  startup_id?: string;
  name: string;
  budget_allocated: number;
  budget_used: number;
  color?: string;
  created_at?: string;
  updated_at?: string;
}

// =================================
// Budget Management Types
// =================================

export interface StartupBudgetOverview {
  id: number;
  startupName: string;
  founderName: string;
  totalAllocated: number;
  totalUsed: number;
  categories: BudgetCategories;
  status: 'active' | 'inactive' | 'suspended';
  lastUpdate: string;
}

export interface BudgetCategories {
  cloud: BudgetCategoryAllocation;
  marketing: BudgetCategoryAllocation;
  it: BudgetCategoryAllocation;
  events: BudgetCategoryAllocation;
  freelances: BudgetCategoryAllocation;
  training: BudgetCategoryAllocation;
}

export interface BudgetCategoryAllocation {
  allocated: number;
  used: number;
}

export interface BudgetForm {
  startupName: string;
  founderName: string;
  totalBudget: string;
  categories: {
    cloud: string;
    marketing: string;
    it: string;
    events: string;
    freelances: string;
    training: string;
  };
}

export interface BudgetCategoryNames {
  cloud: string;
  marketing: string;
  it: string;
  events: string;
  freelances: string;
  training: string;
}

// =================================
// Budget Request Types
// =================================

export interface BudgetRequest {
  id: number;
  startup: string;
  founder: string;
  category: string;
  description: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  priority: 'low' | 'medium' | 'high';
  submissionDate: string;
  reviewDate?: string;
  reviewedBy?: string;
  attachments: string[];
  notes?: string;
}

export interface ApprovalForm {
  action: 'approve' | 'reject';
  reason: string;
  comments: string;
}

export interface RequestStats {
  pending: number;
  underReview: number;
  approved: number;
  rejected: number;
  totalAmount: number;
}

// =================================
// Event Management Types
// =================================

export interface Event {
  id: number;
  title: string;
  description: string;
  type: EventType;
  status: EventStatus;
  date: string;
  time: string;
  duration: string;
  location: string;
  maxAttendees: number;
  currentAttendees: number;
  registrationDeadline: string;
  isPublic: boolean;
  requiresApproval: boolean;
  createdDate: string;
  attendees: EventAttendee[];
}

export interface EventAttendee {
  id: number;
  name: string;
  email: string;
  status: 'Confirmed' | 'Pending' | 'Attended' | 'Cancelled';
}

export interface EventForm {
  title: string;
  description: string;
  type: string;
  date: string;
  time: string;
  duration: string;
  location: string;
  maxAttendees: string;
  registrationDeadline: string;
  isPublic: boolean;
  requiresApproval: boolean;
}

export interface EventStats {
  totalEvents: number;
  upcomingEvents: number;
  completedEvents: number;
  totalAttendees: number;
}

export type EventType = 'Workshop' | 'Networking' | 'Masterclass' | 'Seminar' | 'Conference' | 'Webinar';
export type EventStatus = 'Draft' | 'Upcoming' | 'Completed' | 'Cancelled';

// =================================
// Analytics Types
// =================================

export interface AnalyticsOverview {
  totalUsers: number;
  totalStartups: number;
  totalRevenue: number;
  totalFunding: number;
  growth: GrowthMetrics;
}

export interface GrowthMetrics {
  users: number;
  startups: number;
  revenue: number;
  funding: number;
}

export interface UserEngagement {
  activeUsers: number;
  avgSessionTime: string;
  bounceRate: string;
  pageViews: number;
  logins: number;
  questionnairesCompleted: number;
  resourcesDownloaded: number;
}

export interface StartupsAnalytics {
  byStage: Record<string, number>;
  byIndustry: Record<string, number>;
}

export interface BudgetAnalytics {
  totalAllocated: number;
  totalUsed: number;
  utilizationRate: number;
  categories: BudgetAnalyticsCategory[];
}

export interface BudgetAnalyticsCategory {
  category: string;
  allocated: number;
  used: number;
  remaining: number;
}

export interface RequestsAnalytics {
  total: number;
  approved: number;
  pending: number;
  rejected: number;
  totalAmount: number;
}

export interface AnalyticsData {
  overview: AnalyticsOverview;
  userEngagement: UserEngagement;
  startupsData: StartupsAnalytics;
  budgetAnalytics: BudgetAnalytics;
  requestsAnalytics: RequestsAnalytics;
}

export interface TimeFrame {
  value: string;
  label: string;
}

// =================================
// Suivi (Follow-up) Form Types
// =================================

export interface Question {
  id: string;
  type: QuestionType;
  title: string;
  description?: string;
  required: boolean;
  options?: string[];
}

export type QuestionType = 'text' | 'textarea' | 'select' | 'multiselect' | 'number' | 'rating' | 'checkbox';

export interface QuestionTypeOption {
  type: QuestionType;
  label: string;
  icon: any; // Lucide icon component
  description: string;
}

export interface SuiviForm {
  id: string;
  title: string;
  description: string;
  questions: Question[];
  status: 'draft' | 'active' | 'archived';
  frequency: FormFrequency;
  created_at: string;
  updated_at: string;
  target_startups?: string[];
  responses_count?: number;
}

export type FormFrequency = 'weekly' | 'monthly' | 'quarterly' | 'instant';

export interface FormScheduling {
  frequency: FormFrequency;
  startDate: string;
  time: string;
  timezone: string;
}

export interface FormTargeting {
  targetAll: boolean;
  selectedStartups: string[];
}

export interface FrequencyOption {
  value: FormFrequency;
  label: string;
  description: string;
}

// =================================
// Resource Management Types
// =================================

export interface Resource {
  id: number;
  title: string;
  description: string;
  category: ResourceCategory;
  type: ResourceType;
  fileUrl?: string;
  downloadCount: number;
  isPublic: boolean;
  tags: string[];
  uploadedBy: string;
  uploadedAt: string;
  fileSize?: string;
  thumbnailUrl?: string;
}

export type ResourceCategory = 'business-plan' | 'legal' | 'marketing' | 'finance' | 'technology' | 'operations';
export type ResourceType = 'pdf' | 'video' | 'template' | 'guide' | 'tool';

export interface ResourceForm {
  title: string;
  description: string;
  category: string;
  type: string;
  isPublic: boolean;
  tags: string[];
  file?: File;
}

export interface ResourceStats {
  totalResources: number;
  totalDownloads: number;
  publicResources: number;
  categoriesCount: Record<string, number>;
}

// =================================
// Dashboard Types
// =================================

export interface DashboardStats {
  totalEvents: number;
  upcomingEvents: number;
  completedEvents: number;
  totalRequests: number;
  pendingRequests: number;
  approvedRequests: number;
  totalBudget: number;
  usedBudget: number;
  remainingBudget: number;
}

export interface RecentActivity {
  id: number;
  type: 'request' | 'event' | 'budget' | 'resource';
  user: string;
  action: string;
  amount?: number;
  details?: string;
  time: string;
  status: 'pending' | 'active' | 'completed';
}

export interface QuickAction {
  name: string;
  href: string;
  icon: any; // Lucide icon component
  color: 'blue' | 'green' | 'orange' | 'purple';
}

// =================================
// Profile & Authentication Types
// =================================

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'startup';
  avatar?: string;
  company?: string;
  website?: string;
  industry?: string;
  founded_year?: number;
  team_size?: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  // Step 1: Personal Info
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  
  // Step 2: Company Info
  companyName: string;
  industry: string;
  foundedYear: string;
  teamSize: string;
  website: string;
  description: string;
}

// =================================
// Settings Types
// =================================

export interface SystemSettings {
  siteName: string;
  siteDescription: string;
  supportEmail: string;
  maintenanceMode: boolean;
  registrationEnabled: boolean;
  emailNotifications: boolean;
  autoApproval: boolean;
  defaultBudget: number;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'moderator';
  status: 'active' | 'inactive';
  lastLogin: string;
  createdAt: string;
}

export interface NewUserForm {
  name: string;
  email: string;
  role: 'admin' | 'moderator';
}

// =================================
// Common Utility Types
// =================================

export type Status = 'pending' | 'approved' | 'rejected' | 'active' | 'inactive';
export type Priority = 'low' | 'medium' | 'high';

export interface StatusInfo {
  color: string;
  icon?: any; // Lucide icon component
}

export interface SearchFilters {
  searchTerm: string;
  statusFilter: string;
  categoryFilter: string;
  industryFilter: string;
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

// =================================
// API Response Types
// =================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ApiListResponse<T> extends ApiResponse<T[]> {
  pagination?: PaginationInfo;
}

// =================================
// Form Validation Types
// =================================

export interface ValidationError {
  field: string;
  message: string;
}

export interface FormState<T> {
  data: T;
  errors: ValidationError[];
  isSubmitting: boolean;
  isValid: boolean;
}

// =================================
// Color Theme Types
// =================================

export interface ColorTheme {
  primary: string;
  secondary: string;
  success: string;
  warning: string;
  error: string;
  info: string;
}

export interface CategoryColors {
  [key: string]: string;
}

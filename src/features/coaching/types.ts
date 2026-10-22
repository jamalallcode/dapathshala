export type PlanTier = 'trial' | 'pro' | 'enterprise';
export type BillingCycle = 'monthly' | 'yearly';
export type SubscriptionStatus = 'active' | 'expiring_soon' | 'expired' | 'trial';
export type PaymentMethod = 'bkash' | 'nagad' | 'upay' | 'card' | 'bank';

export interface CoachingProfile {
  id: string;
  name: string;
  tagline: string;
  logo: string;
  themeColor: string;
  eiinNumber: string;
  phone: string;
  email: string;
  division: string;
  district: string;
  address: string;
  branchesCount: number;
  studentCapacity: number;
  curriculumLevels: string[];
  subdomain: string;
  foundedYear: string;
  registeredAt: string;
}

export interface SubscriptionPlan {
  id: PlanTier;
  name: string;
  englishName: string;
  badge?: string;
  popular?: boolean;
  monthlyPrice: number;
  yearlyPrice: number;
  studentLimit: number;
  features: string[];
  description: string;
}

export interface SubscriptionState {
  planId: PlanTier;
  planName: string;
  status: SubscriptionStatus;
  billingCycle: BillingCycle;
  startDate: string; // ISO
  renewalDate: string; // ISO
  autoRenew: boolean;
  lastPaymentMethod?: PaymentMethod;
  lastAmountPaid?: number;
  lastTransactionId?: string;
  smsAlertsEnabled: boolean;
  emailAlertsEnabled: boolean;
  whatsappAlertsEnabled: boolean;
  alertDaysBefore: number[]; // e.g. [7, 3, 1]
}

export interface Invoice {
  id: string;
  invoiceNo: string;
  date: string;
  planName: string;
  cycle: BillingCycle;
  amount: number;
  paymentMethod: PaymentMethod;
  transactionId: string;
  status: 'paid' | 'pending' | 'failed';
  downloadUrl?: string;
}

export interface RenewalAlertMessage {
  id: string;
  timestamp: string;
  type: 'sms' | 'email' | 'system';
  message: string;
  read: boolean;
}

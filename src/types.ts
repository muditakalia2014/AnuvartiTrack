export interface User {
  id: number;
  username: string;
  role: 'admin' | 'user';
}

export interface Log {
  id: number;
  userId: number;
  username: string;
  action: 'login' | 'logout';
  timestamp: string;
}

export interface Customer {
  id: number;
  sNo: number;
  lastYearIssueDate: string;
  name: string;
  refContact: string;
  email?: string;
  type: string;
  segment: string;
  registrationNumber: string;
  grossPremium: number;
  netPremium: number;
  company: string;
  policyNumber: string;
  lyCbPercentage: number;
  expiryDate: string; // ISO string or YYYY-MM-DD
}

export interface FollowUp {
  id: number;
  customerId: number;
  followUpDate: string;
  feedback: string;
  proposalNumber: string;
  newPolicyNumber?: string;
  chosenCompany: string;
  otherCompanyName?: string;
  grossPremium: number;
  netPremium: number;
  rcCollected: 'Yes' | 'No';
  panCollected: 'Yes' | 'No';
  gstRecorded: 'Yes' | 'No';
  status: 'Follow-up Only' | 'Proposal Pending' | 'Proposal Made' | 'Policy Made';
  updatedAt: string;
  
  // New fields for detailed customer capture
  isExistingOrNew?: string;
  customerType?: string;
  referredBy?: string;
  busType?: string;
  previousInsuranceCompany?: string;
  insuranceExpiryDate?: string;
  usage?: string;
  permit?: string;
  seatingCapacity?: string;
  idvValue?: number;
  manufacturingYear?: string;
  cbPercentage?: number;
  cbValue?: number;
  finalPaymentAmount?: number;
  coCommissionPercentage?: number;
  commissionAmount?: number;
  profitAmount?: number;
}

export type BucketType = '7days' | '15days' | '30days';

export const INSURANCE_COMPANIES = [
  'Tata',
  'ICICI',
  'HDFC',
  'Reliance',
  'IFFCO',
  'Girnar',
  'Shree Ram',
  'Future Generali',
  'Bajaj',
  'Landmark',
  'Go Digit',
  'Niva',
  'Others'
];

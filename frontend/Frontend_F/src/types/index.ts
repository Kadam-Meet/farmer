import { Key, ReactNode } from "react";

export interface User {
  id: string;
  name: string;
  email: string;
  contactNumber: string;
  userType: 'farmer' | 'worker';
  profilePicture?: string;
  city?: string;
  state?: string;
  fullAddress?: string;
  // Worker specific fields

  jobExpertise?: string[];
  customJobExpertise?: string;
  skillLevel?: string;
  workCapacity?: string;
  expectedSalary?: string;
  salaryType?: string;
  availabilityDuration?: string;
  accommodationNeeded?: boolean;
  additionalBenefitsRequired?: string[];
  customAdditionalBenefits?: string;
  verified: boolean;
}

export interface Job {
  farmer_name: any;
  job_type: string;
  job_id: Key | null | undefined;
  land_area: ReactNode;
  skill_level: ReactNode;
  contactInfo: ReactNode;
  created_at: string | number | Date;
  applicationStatus: any;
  job_title: ReactNode;
  city: ReactNode;
  id: string;
  farmerId: string;
  title: string;
  description: string;
  location: string;
  state: string;
  district: string;
  workType: string;
  jobTypes: string[];
  landArea: string;
  duration: string;
  payRate: string;
  paymentType: string;
  salaryAmount: string;
  requirements: string[];
  workersNeeded: number;
  additionalBenefits: string[];
  applicants: string[];
  requests: JobRequest[];
  status: 'open' | 'closed' | 'in_progress';
  createdAt: Date;
  farmerName: string;
  farmerPhone: string;
  farmerEmail?: string;
  images?: string[];
  urgencyLevel: string;
  workingHours: string;
  accommodationType: string;
  transportationProvided: boolean;
  skillLevel: string;
  physicalDemands: string;
  customJobType?: string;
}

export interface JobRequest {
  id: string;
  jobId: string;
  workerId: string;
  workerName: string;
  workerPhone: string;
  workerEmail?: string;
  status: 'pending' | 'accepted' | 'rejected';
  appliedAt: Date;
  message?: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'job_application' | 'request_accepted' | 'request_rejected' | 'new_job';
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
  actionUrl?: string;
}

export interface NewsItem {
  id: string;
  title: string;
  content: string;
  category: 'subsidy' | 'education' | 'news' | 'technology';
  imageUrl?: string;
  publishedAt: Date;
}

export interface Listing {
  id: string;
  title: string;
  description: string;
  type: 'equipment' | 'land';
  category?: string;
  price: number;
  period: 'day' | 'week' | 'month';
  location: string;
  image: string;
  condition?: string;
  ownerId: string;
  ownerName: string;
  ownerPhone: string;
  availableFrom?: Date;
  availableTo?: Date;
  createdAt: Date;
}

export type Language = 'en' | 'hi' | 'gu';

export interface Translations {
  [key: string]: {
    en: string;
    hi: string;
    gu: string;
  };
}
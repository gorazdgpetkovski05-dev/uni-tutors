
export type UserRole = 'student' | 'teacher' | 'admin';
export type BookingStatus = 'pending' | 'approved' | 'rejected';

export interface Professor {
  id: string;
  name: string;
  avatar: string;
  specialty: string;
  rating: number;
}

export interface Lecture {
  id: string;
  title: string;
  date: string; // ISO date string
  duration: number; // minutes
}

export interface Course {
  id: string;
  title: string;
  code: string; // e.g., "CSE101"
  description: string;
  professorId: string;
  image: string;
  university?: string;
  lectures: Lecture[];
  priceFull: number; // 6000
  priceSingle: number; // 750
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
}

export interface Booking {
  id: string;
  userId: string;
  courseId: string;
  courseTitle: string;
  date: string;
  type: BookingType;
  status: BookingStatus;
  userEmail: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  xp: number;
  level: number;
  credits: number; // Currency or subscription status
  subscriptionTier: 'free' | 'pro';
  bookedLectures: string[]; // IDs of booked lectures
  purchasedCourses: string[]; // IDs of full courses
  achievements: Achievement[];
  bookings?: Booking[]; // Extended for dashboard view
}

export type BookingType = 'single' | 'full';

// New Types for Dynamic Content
export interface LandingPageData {
  heroTitle: string;
  heroSubtitle: string;
  statsStudents: string;
  statsProfessors: string;
  statsLectures: string;
  statsPassRate: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'info' | 'achievement';
}


export interface Professor {
  id: string; // Automatic UUID
  name: string;
  email: string; // Mapping to User
  customTag: string; // e.g. "PNikolaJankoski"
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
  professorName?: string; // Optional for UI display
  image: string;
  university?: string;
  lectures: Lecture[];
  priceFull: number; // 6000
  priceSingle: number; // 750
}

export type BookingType = 'single' | 'full';

// New Types for Dynamic Content
export interface LandingPageData {
  heroTitle: string;
  heroSubtitle: string;
  statsStudents: string;
  statsSuccessStories: string;
  statsLectures: string;
  statsPassRate: string;
}

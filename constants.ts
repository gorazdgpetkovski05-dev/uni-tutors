
import { Course, Professor, User, Booking } from './types';

// We keep the variable name PROFESSORS to avoid refactoring types, 
// but the content now reflects "Certified Professionals"
export const PROFESSORS: Professor[] = [
  {
    id: 'p1',
    name: 'Nikola Jankoski',
    specialty: 'Senior Software Engineer',
    avatar: 'https://ui-avatars.com/api/?name=Nikola+Jankoski&background=6366f1&color=fff',
    rating: 4.9,
  },
  {
    id: 'p2',
    name: 'Dragan',
    specialty: 'Financial Analyst & Economist',
    avatar: 'https://ui-avatars.com/api/?name=Dragan&background=8b5cf6&color=fff',
    rating: 4.8,
  },
  {
    id: 'p3',
    name: 'Dr. Sarah Trajkov',
    specialty: 'Medical Practitioner (MD)',
    avatar: 'https://picsum.photos/100/100?random=3',
    rating: 5.0,
  },
];

export const COURSES: Course[] = [
  {
    id: 'c1',
    title: 'Advanced Programming',
    code: 'CS-202',
    description: 'Master C++ and Algorithms. Ideal for FINKI and Computer Science students wanting to ace their midterms.',
    professorId: 'p1',
    image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    priceFull: 6000,
    priceSingle: 750,
    lectures: Array.from({ length: 10 }).map((_, i) => ({
      id: `l-c1-${i}`,
      title: `Session ${i + 1}: ${['Pointers & Refs', 'Memory Management', 'OOP Principles', 'Inheritance', 'Polymorphism', 'Templates', 'STL Containers', 'Algorithms', 'Exam Prep 1', 'Exam Prep 2'][i]}`,
      date: new Date(Date.now() + (i + 1) * 86400000 * 2).toISOString(),
      duration: 90,
    })),
  },
  {
    id: 'c2',
    title: 'Digital Marketing 101',
    code: 'MKT-101',
    description: 'Practical marketing strategies, SEO, and Social Media management. Suitable for Economics and Business students.',
    professorId: 'p2',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    priceFull: 6000,
    priceSingle: 750,
    lectures: Array.from({ length: 10 }).map((_, i) => ({
      id: `l-c2-${i}`,
      title: `Workshop ${i + 1}: Topic ${i + 1}`,
      date: new Date(Date.now() + (i + 1) * 86400000 * 3).toISOString(),
      duration: 120,
    })),
  },
  {
    id: 'c3',
    title: 'Human Anatomy Basics',
    code: 'MED-105',
    description: 'Comprehensive review of skeletal and muscular systems. Essential for Medical Faculty students.',
    professorId: 'p3',
    image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    priceFull: 6000,
    priceSingle: 750,
    lectures: Array.from({ length: 10 }).map((_, i) => ({
      id: `l-c3-${i}`,
      title: `Lab Review ${i + 1}: Part ${i + 1}`,
      date: new Date(Date.now() + (i + 1) * 86400000 * 4).toISOString(),
      duration: 90,
    })),
  },
];

export const MOCK_USER: User = {
  id: 'u1',
  name: 'Marko Student',
  email: 'marko.student@gmail.com',
  role: 'student',
  xp: 1250,
  level: 3,
  credits: 1500,
  subscriptionTier: 'free',
  bookedLectures: ['l-c1-0', 'l-c1-1'],
  purchasedCourses: [],
  achievements: [
    { id: 'a1', title: 'Freshman', description: 'Attended first lecture', icon: 'graduation-cap', unlocked: true },
    { id: 'a2', title: 'Knowledge Seeker', description: 'Submitted 5 assignments', icon: 'code', unlocked: true },
  ],
};

// --- SPECIFIC ACCOUNTS AS REQUESTED ---

export const MOCK_ADMIN: User = {
  id: 'admin1',
  name: 'Gorazd Admin',
  email: 'gorazd.g.petkovski05@gmail.com',
  role: 'admin',
  xp: 0,
  level: 99,
  credits: 0,
  subscriptionTier: 'pro',
  bookedLectures: [],
  purchasedCourses: [],
  achievements: [],
};

export const MOCK_TEACHER_1: User = {
  id: 'p1', 
  name: 'Nikola Jankoski',
  email: 'nikola.jankoski@gmail.com',
  role: 'teacher',
  xp: 0,
  level: 5, 
  credits: 0, 
  subscriptionTier: 'pro',
  bookedLectures: [],
  purchasedCourses: [],
  achievements: [],
};

export const MOCK_TEACHER_2: User = {
  id: 'p2', 
  name: 'Dragan',
  email: 'dragan@gmail.com',
  role: 'teacher',
  xp: 0,
  level: 5, 
  credits: 0, 
  subscriptionTier: 'pro',
  bookedLectures: [],
  purchasedCourses: [],
  achievements: [],
};

export const MOCK_BOOKINGS: Booking[] = [
  { 
    id: 'b1', 
    userId: 'u2', 
    courseId: 'c1', 
    courseTitle: 'Advanced Programming', 
    date: new Date().toISOString(), 
    type: 'single', 
    status: 'pending', 
    userEmail: 'student.one@yahoo.com' 
  },
  { 
    id: 'b2', 
    userId: 'u3', 
    courseId: 'c2', 
    courseTitle: 'Digital Marketing 101', 
    date: new Date().toISOString(), 
    type: 'full', 
    status: 'approved', 
    userEmail: 'marketing.fan@gmail.com' 
  },
];

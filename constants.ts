
import { Course, Professor } from './types';

// We keep the variable name PROFESSORS to avoid refactoring types, 
// but the content now reflects "Certified Professionals"
export const PROFESSORS: Professor[] = [
  {
    id: 'p1',
    name: 'Nikola Jankoski',
    email: 'nikola.jankoski@gmail.com',
    customTag: 'PNikolaJankoski',
    specialty: 'Senior Software Engineer',
    avatar: 'https://ui-avatars.com/api/?name=Nikola+Jankoski&background=6366f1&color=fff',
    rating: 4.9,
  },
  {
    id: 'p2',
    name: 'Dragan',
    email: 'dragan@gmail.com',
    customTag: 'PDragan',
    specialty: 'Financial Analyst & Economist',
    avatar: 'https://ui-avatars.com/api/?name=Dragan&background=8b5cf6&color=fff',
    rating: 4.8,
  },
  {
    id: 'p3',
    name: 'Dr. Sarah Trajkov',
    email: 'sarah.trajkov@gmail.com',
    customTag: 'PSarahTrajkov',
    specialty: 'Medical Practitioner (MD)',
    avatar: 'https://picsum.photos/100/100?random=3',
    rating: 5.0,
  },
];

export const COURSES: Course[] = [];

export const WHATSAPP_NUMBER = "+38970356541";
export const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER.replace(/\+/g, '').replace(/\s/g, '')}`;

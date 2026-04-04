
export type UserRole = 'student' | 'professor' | 'admin';
export type EnrollmentStatus = 'pending' | 'approved' | 'rejected' | 'completed' | 'cancelled';
export type SessionStatus = 'scheduled' | 'completed' | 'missed' | 'cancelled';
export type CourseStatus = 'draft' | 'published' | 'archived';
export type TicketStatus = 'pending' | 'in_review' | 'approved' | 'rejected';
export type SupportTicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed';
export type SupportTicketPriority = 'low' | 'medium' | 'high';
export type NotificationType =
  | 'booking_request' | 'booking_approved' | 'booking_rejected' | 'booking_completed'
  | 'review_received' | 'ticket_update' | 'course_proposal' | 'support_ticket' | 'general';

export interface Profile {
  id: string;
  role: UserRole;
  full_name: string;
  avatar_url: string | null;
  phone: string | null;
  phone_verified: boolean;
  phone_verified_at: string | null;
  xp: number;
  level: number;
  created_at: string;
  updated_at: string;
}

export interface StudentXP {
  id: string;
  student_id: string;
  amount: number;
  reason: string;
  reference_id: string | null;
  created_at: string;
}

export interface Professor {
  id: string;
  name: string;
  email: string;
  customTag: string;
  avatar: string;
  specialty: string;
  rating: number;
  courseCount?: number;
}

export interface ProfessorRecord {
  id: string;
  specialty: string;
  custom_tag: string | null;
  created_at: string;
  profile?: Profile;
}

export interface Lecture {
  id: string;
  title: string;
  date: string;
  duration: number;
}

export interface Midterm {
  id: string;
  title: string;
  sessions?: number;
  price: number;
  course_id?: string;
}

export interface CurriculumItem {
  id?: string;
  title: string;
  description: string;
  sort_order?: number;
  course_id?: string;
}

export interface Course {
  id: string;
  title: string;
  code: string;
  description: string;
  professorId: string;
  professorName?: string;
  image: string;
  university?: string;
  lectures: Lecture[];
  curriculum?: CurriculumItem[];
  priceFull: number;
  priceSingle: number;
  midterms?: Midterm[];
  customPriceDisplay?: string;
  hidden?: boolean;
  status?: CourseStatus;
  averageRating?: number;
  reviewCount?: number;
  created_at?: string;
}

export interface CourseRecord {
  id: string;
  title: string;
  code: string;
  description: string;
  title_en?: string;
  description_en?: string;
  professor_id: string | null;
  image: string | null;
  university: string | null;
  price_full: number;
  price_single: number;
  custom_price_display: string | null;
  status: CourseStatus;
  created_at: string;
  updated_at: string;
  curriculum_items?: CurriculumItem[];
  midterms?: Midterm[];
}

export interface Enrollment {
  id: string;
  student_id: string;
  course_id: string;
  status: EnrollmentStatus;
  booking_type: string;
  message: string | null;
  discord_link: string | null;
  admin_notes: string | null;
  discount_percent: number;
  price_paid: number | null;
  created_at: string;
  updated_at: string;
  course?: CourseRecord;
  student?: Profile;
}

export interface Session {
  id: string;
  enrollment_id: string;
  status: SessionStatus;
  title: string | null;
  notes: string | null;
  session_date: string | null;
  created_at: string;
}

export interface Review {
  id: string;
  student_id: string;
  course_id: string;
  professor_id: string;
  enrollment_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  student?: Profile;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  link: string | null;
  created_at: string;
}

export interface CourseProposal {
  id: string;
  professor_id: string;
  title: string;
  description: string;
  course_code: string | null;
  university: string | null;
  status: TicketStatus;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
  professor?: Profile;
}

export interface SupportTicket {
  id: string;
  user_id: string;
  subject: string;
  description: string;
  status: SupportTicketStatus;
  priority: SupportTicketPriority;
  created_at: string;
  updated_at: string;
  user?: Profile;
  messages?: SupportTicketMessage[];
}

export interface SupportTicketMessage {
  id: string;
  ticket_id: string;
  sender_id: string;
  message: string;
  created_at: string;
  sender?: Profile;
}

export interface Message {
  id: string;
  enrollment_id: string;
  sender_id: string;
  content: string;
  read: boolean;
  created_at: string;
}

export interface DirectMessage {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  read: boolean;
  created_at: string;
}

export type BookingType = 'single' | 'full' | 'midterm';

export interface LandingPageData {
  heroTitle: string;
  heroSubtitle: string;
  statsStudents: string;
  statsSuccessStories: string;
  statsLectures: string;
  statsPassRate: string;
}

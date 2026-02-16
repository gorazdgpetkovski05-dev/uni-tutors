
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Course, LandingPageData, Booking, User, UserRole } from '../types';
import { supabase } from '../supabaseClient';
import { useAuth } from './AuthContext';

interface DataContextType {
  courses: Course[];
  addCourse: (course: Course) => Promise<void>;
  bookings: Booking[];
  addBooking: (booking: Booking) => Promise<void>;
  updateBookingStatus: (id: string, status: 'approved' | 'rejected') => Promise<void>;
  landingPageData: LandingPageData;
  updateLandingPage: (data: Partial<LandingPageData>) => Promise<void>;
  users: User[];
  updateUserRole: (userId: string, role: UserRole) => Promise<void>;
  refreshData: () => Promise<void>;
}

const defaultLandingPage: LandingPageData = {
  heroTitle: "Master your subjects at",
  heroSubtitle: "Book expert professors for specific lectures or full courses. Flexible pricing designed for students.",
  statsStudents: "1,200+",
  statsProfessors: "50+",
  statsLectures: "3,500+",
  statsPassRate: "98%"
};

const DataContext = createContext<DataContextType>({
  courses: [],
  addCourse: async () => {},
  bookings: [],
  addBooking: async () => {},
  updateBookingStatus: async () => {},
  landingPageData: defaultLandingPage,
  updateLandingPage: async () => {},
  users: [],
  updateUserRole: async () => {},
  refreshData: async () => {},
});

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [landingPageData, setLandingPageData] = useState<LandingPageData>(defaultLandingPage);

  const refreshData = async () => {
      try {
        // 1. Fetch Config
        const { data: configData } = await supabase
          .from('site_config')
          .select('value')
          .eq('key', 'landing_page')
          .single();
        if (configData) setLandingPageData(configData.value);

        // 2. Fetch Courses
        const { data: coursesData, error: coursesError } = await supabase
          .from('courses')
          .select('*, lectures(*)');
        
        if (!coursesError && coursesData && coursesData.length > 0) {
            const mappedCourses: Course[] = coursesData.map((c: any) => ({
                id: c.id,
                title: c.title,
                code: c.code,
                description: c.description,
                professorId: c.professor_id || 'p1', 
                professorName: c.professor_name,
                image: c.image,
                priceFull: c.price_full,
                priceSingle: c.price_single,
                lectures: c.lectures ? c.lectures.map((l: any) => ({
                    id: l.id,
                    title: l.title,
                    date: l.date,
                    duration: l.duration
                })) : []
            }));
            setCourses(mappedCourses);
        } else {
            setCourses([]);
        }

        // 3. Fetch Bookings
        let query = supabase.from('bookings').select('*').order('created_at', { ascending: false });
        const { data: bookingData } = await query;
        
        if (bookingData) {
          const mappedBookings: Booking[] = bookingData.map((b: any) => ({
              id: b.id,
              userId: b.user_id,
              userEmail: b.user_email,
              courseId: b.course_id,
              courseTitle: b.course_title,
              type: b.type,
              status: b.status,
              date: b.date,
          }));
          setBookings(mappedBookings);
        }

        // 4. Fetch Users (Admin Only)
        if (user?.role === 'admin') {
            const { data: userData } = await supabase
              .from('profiles')
              .select('*')
              .order('created_at', { ascending: false });
            
            if (userData) {
                const mappedUsers: User[] = userData.map((u: any) => ({
                    id: u.id,
                    name: u.full_name || 'Student',
                    email: u.email,
                    role: u.role,
                    xp: u.xp,
                    level: u.level,
                    credits: u.credits,
                    subscriptionTier: 'free',
                    bookedLectures: [],
                    purchasedCourses: [],
                    achievements: []
                }));
                setUsers(mappedUsers);
            }
        }
      } catch (err) {
        console.error("Error refreshing data:", err);
      }
  };

  useEffect(() => {
    refreshData();
  }, [user]);

  const addCourse = async (course: Course) => {
    if (!user) return;
    
    let safeImage = course.image;
    if (safeImage.startsWith('blob:')) {
        safeImage = `https://source.unsplash.com/random/800x600?study,${course.code}`;
    }

    const { data: courseData, error: courseError } = await supabase.from('courses').insert({
        title: course.title,
        code: course.code,
        description: course.description,
        professor_id: course.professorId, 
        image: safeImage,
        price_full: course.priceFull,
        price_single: course.priceSingle
    }).select().single();

    if (courseError) throw new Error(courseError.message);

    if (courseData && course.lectures.length > 0) {
        const lectureInserts = course.lectures.map(l => ({
            course_id: courseData.id,
            title: l.title,
            date: l.date,
            duration: l.duration
        }));
        await supabase.from('lectures').insert(lectureInserts);
    }
    await refreshData();
  };

  const addBooking = async (booking: Booking) => {
     const { data: { session } } = await supabase.auth.getSession();
     if (!session) throw new Error("Session expired. Please login again.");

     const { error } = await supabase.from('bookings').insert({
       user_email: user?.email,
       course_id: booking.courseId, 
       course_title: booking.courseTitle,
       type: booking.type,
       status: 'pending',
       date: booking.date
     });
     
     if (error) throw new Error(`Booking failed: ${error.message}`); 
     await refreshData();
  };

  const updateBookingStatus = async (id: string, status: 'approved' | 'rejected') => {
    const { error } = await supabase.from('bookings').update({ status }).eq('id', id);
    if (error) throw error;
    await refreshData();
  };

  const updateLandingPage = async (data: Partial<LandingPageData>) => {
    const newData = { ...landingPageData, ...data };
    setLandingPageData(newData);
    await supabase.from('site_config').upsert({
        key: 'landing_page',
        value: newData
    }, { onConflict: 'key' });
  };

  const updateUserRole = async (userId: string, role: UserRole) => {
      const { error } = await supabase.from('profiles').update({ role }).eq('id', userId);
      if (error) throw error;
      await refreshData();
  };

  return (
    <DataContext.Provider value={{ 
      courses, 
      addCourse, 
      bookings, 
      addBooking, 
      updateBookingStatus,
      landingPageData, 
      updateLandingPage,
      users, 
      updateUserRole,
      refreshData
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => useContext(DataContext);

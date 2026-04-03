
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Course, LandingPageData, Professor } from '../types';
import { supabase } from '../lib/supabase';
import { useLanguage } from './LanguageContext';

interface DataContextType {
  courses: Course[];
  landingPageData: LandingPageData;
  professors: Professor[];
  loading: boolean;
}

const BASELINE_STUDENTS = 1200;

const defaultLandingPage: LandingPageData = {
  heroTitle: "Master your courses at",
  heroSubtitle: "Book expert professors for specific lectures or full courses. Flexible pricing designed for students.",
  statsStudents: String(BASELINE_STUDENTS),
  statsSuccessStories: "450",
  statsLectures: "3500",
  statsPassRate: "98"
};

const DataContext = createContext<DataContextType>({
  courses: [],
  landingPageData: defaultLandingPage,
  professors: [],
  loading: true,
});

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [professors, setProfessors] = useState<Professor[]>([]);
  const [landingPageData, setLandingPageData] = useState<LandingPageData>(defaultLandingPage);
  const [loading, setLoading] = useState(true);
  const { language } = useLanguage();

  // Helper: pick translated field or fall back to default (Macedonian)
  const pick = (row: any, field: string) => {
    if (language === 'en' && row[`${field}_en`]) return row[`${field}_en`];
    return row[field];
  };

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch dynamic student count
        const { count: studentCount } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .eq('role', 'student');

        if (studentCount !== null) {
          setLandingPageData(prev => ({
            ...prev,
            statsStudents: String(BASELINE_STUDENTS + studentCount),
          }));
        }

        // Fetch professors (join professors with profiles to get name, email, avatar)
        const { data: profData, error: profError } = await supabase
          .from('professors')
          .select('id, specialty, custom_tag, profiles(full_name, avatar_url)');

        if (profError && import.meta.env.DEV) console.error('Error fetching professors:', profError.message);

        const mappedProfessors: Professor[] = (profData || []).map((p: any) => ({
          id: p.id,
          name: p.profiles?.full_name || 'Unknown',
          email: '',
          specialty: p.specialty || '',
          rating: 0,
          avatar: p.profiles?.avatar_url || `https://picsum.photos/seed/${p.id}/200/200`,
          customTag: p.custom_tag || '',
          courseCount: 0,
        }));

        // Fetch courses
        const { data: courseData, error: courseError } = await supabase
          .from('courses')
          .select('*')
          .eq('status', 'published')
          .order('created_at', { ascending: true });

        if (courseError) {
          if (import.meta.env.DEV) console.error('Error fetching courses:', courseError.message);
          return;
        }

        // Fetch curriculum items and midterms separately
        const courseIds = (courseData || []).map((c: any) => c.id);

        const { data: curriculumData, error: currError } = await supabase
          .from('curriculum_items')
          .select('*')
          .in('course_id', courseIds)
          .order('sort_order', { ascending: true });

        if (currError && import.meta.env.DEV) console.error('Error fetching curriculum:', currError.message);

        const { data: midtermData, error: midError } = await supabase
          .from('midterms')
          .select('*')
          .in('course_id', courseIds);

        if (midError && import.meta.env.DEV) console.error('Error fetching midterms:', midError.message);

        // Fetch average ratings per course
        const { data: ratingData } = await supabase
          .from('reviews')
          .select('course_id, rating')
          .in('course_id', courseIds);

        const ratingsMap: Record<string, { sum: number; count: number }> = {};
        (ratingData || []).forEach((r: any) => {
          if (!ratingsMap[r.course_id]) ratingsMap[r.course_id] = { sum: 0, count: 0 };
          ratingsMap[r.course_id].sum += r.rating;
          ratingsMap[r.course_id].count += 1;
        });

        // Build professor name lookup
        const profNameMap: Record<string, string> = {};
        mappedProfessors.forEach(p => { profNameMap[p.id] = p.name; });

        const mappedCourses: Course[] = (courseData || []).map((c: any) => ({
          id: c.id,
          title: pick(c, 'title'),
          code: c.code,
          description: pick(c, 'description'),
          professorId: c.professor_id || '',
          professorName: profNameMap[c.professor_id] || undefined,
          image: c.image || '',
          university: c.university || '',
          priceSingle: c.price_single,
          priceFull: c.price_full,
          customPriceDisplay: c.custom_price_display || undefined,
          status: c.status,
          curriculum: (curriculumData || [])
            .filter((ci: any) => ci.course_id === c.id)
            .map((ci: any) => ({
              id: ci.id,
              title: pick(ci, 'title'),
              description: pick(ci, 'description'),
              sort_order: ci.sort_order,
            })),
          midterms: (midtermData || [])
            .filter((m: any) => m.course_id === c.id)
            .map((m: any) => ({
              id: m.id,
              title: pick(m, 'title'),
              price: m.price,
            })),
          lectures: [],
          averageRating: ratingsMap[c.id] ? ratingsMap[c.id].sum / ratingsMap[c.id].count : undefined,
          reviewCount: ratingsMap[c.id]?.count ?? 0,
          created_at: c.created_at,
        }));
        setCourses(mappedCourses);

        // Fetch professor ratings from reviews
        const { data: profRatingData } = await supabase
          .from('reviews')
          .select('professor_id, rating');

        const profRatingsMap: Record<string, { sum: number; count: number }> = {};
        (profRatingData || []).forEach((r: any) => {
          if (!profRatingsMap[r.professor_id]) profRatingsMap[r.professor_id] = { sum: 0, count: 0 };
          profRatingsMap[r.professor_id].sum += r.rating;
          profRatingsMap[r.professor_id].count += 1;
        });

        // Compute course count per professor and update mappedProfessors
        const profCourseCount: Record<string, number> = {};
        mappedCourses.forEach(c => { if (c.professorId) profCourseCount[c.professorId] = (profCourseCount[c.professorId] || 0) + 1; });
        mappedProfessors.forEach(p => {
          p.courseCount = profCourseCount[p.id] || 0;
          if (profRatingsMap[p.id]) {
            p.rating = Math.round((profRatingsMap[p.id].sum / profRatingsMap[p.id].count) * 10) / 10;
          }
        });

        setProfessors(mappedProfessors);
      } catch (err) {
        if (import.meta.env.DEV) console.error('Error fetching data from Supabase:', err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [language]);

  return (
    <DataContext.Provider value={{
      courses,
      landingPageData,
      professors,
      loading,
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => useContext(DataContext);

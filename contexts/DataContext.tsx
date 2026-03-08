
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Course, LandingPageData, Professor } from '../types';

interface DataContextType {
  courses: Course[];
  landingPageData: LandingPageData;
  professors: Professor[];
}

const defaultLandingPage: LandingPageData = {
  heroTitle: "Master your courses at",
  heroSubtitle: "Book expert professors for specific lectures or full courses. Flexible pricing designed for students.",
  statsStudents: "1200",
  statsSuccessStories: "450",
  statsLectures: "3500",
  statsPassRate: "98"
};

const DataContext = createContext<DataContextType>({
  courses: [],
  landingPageData: defaultLandingPage,
  professors: [],
});

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [professors, setProfessors] = useState<Professor[]>([]);
  const [landingPageData] = useState<LandingPageData>(defaultLandingPage);

  useEffect(() => {
    // Mock Data
    const mockProfessors: Professor[] = [
        {
            id: '1',
            name: 'Dragan Jakimovski',
            email: 'dragan@example.com',
            specialty: 'Computer Science',
            rating: 4.9,
            avatar: 'https://picsum.photos/seed/dragan/200/200',
            customTag: 'Top Rated'
        },
        {
            id: '2',
            name: 'Nikola Jankoski',
            email: 'nikola@example.com',
            specialty: 'Mathematics',
            rating: 4.7,
            avatar: 'https://picsum.photos/seed/nikola/200/200',
            customTag: 'Expert'
        }
    ];
    setProfessors(mockProfessors);

    const mockCourses: Course[] = [
      {
        id: 'math-2',
        title: 'Математика 2 / Дискретна Математика',
        code: 'МАТ-2 / ДМ',
        description: 'Овој курс те учи на строга логика и прецизно докажување факти. Ќе поминеш пат од основните правила на размислување и дефинирање врски меѓу податоци, па сè до решавање комплексни проблеми преку препознавање шеми и математички редослед.',
        image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=1350&q=80', // Math/Logic theme
        professorId: '2',
        university: 'ФИНКИ',
        priceSingle: 750,
        priceFull: 6000,
        lectures: [
          { id: 'l1', title: 'Искази', date: '2026-03-01T10:00:00Z', duration: 90 },
          { id: 'l2', title: 'Логички исказни еквивалентности и закони', date: '2026-03-04T10:00:00Z', duration: 90 },
          { id: 'l3', title: 'Предикати и квантификатори', date: '2026-03-08T10:00:00Z', duration: 90 },
          { id: 'l4', title: 'Методи на изведување заклучоци', date: '2026-03-11T10:00:00Z', duration: 90 },
          { id: 'l5', title: 'Докази', date: '2026-03-15T10:00:00Z', duration: 90 },
          { id: 'l6', title: 'Множества', date: '2026-03-18T10:00:00Z', duration: 90 },
          { id: 'l7', title: 'Функции дел 1', date: '2026-03-22T10:00:00Z', duration: 90 },
          { id: 'l8', title: 'Функции дел 2', date: '2026-03-25T10:00:00Z', duration: 90 },
          { id: 'l9', title: 'Релации дел 1', date: '2026-03-29T10:00:00Z', duration: 90 },
          { id: 'l10', title: 'Релации дел 2 и суми', date: '2026-04-01T10:00:00Z', duration: 90 },
          { id: 'l11', title: 'Низи, прогресии и испитување монотоност на низа', date: '2026-04-05T10:00:00Z', duration: 90 },
          { id: 'l12', title: 'Математичка индукција и рекурентни релации', date: '2026-04-08T10:00:00Z', duration: 90 }
        ]
      },
      {
        id: 'aps',
        title: 'Алгоритми и податочни структури',
        code: 'АПС',
        description: 'Совладајте ги основните и напредните структури на податоци и алгоритми. Научете како да пишувате ефикасен код и да решавате комплексни проблеми.',
        image: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=1350&q=80', // Coding/Algorithm theme
        professorId: '1',
        university: 'ФИНКИ',
        priceSingle: 800,
        priceFull: 12000,
        customPriceDisplay: '6000 / midterm',
        hidden: true,
        midterms: [
          { id: 'mt1', title: 'First Midterm', sessions: 15, price: 6000 },
          { id: 'mt2', title: 'Second Midterm', sessions: 17, price: 6000 }
        ],
        lectures: [
          { id: 'aps1', title: 'Вовед во алгоритми', date: '2026-03-02T12:00:00Z', duration: 120 },
          { id: 'aps2', title: 'Линеарни структури', date: '2026-03-05T12:00:00Z', duration: 120 }
        ]
      },
      {
        id: 'oop',
        title: 'Објектно ориентирано програмирање',
        code: 'ООП',
        description: 'Научете ги принципите на ООП: енкапсулација, наследување, полиморфизам и апстракција преку практични примери во C++ и Java.',
        image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1350&q=80', // Programming theme
        professorId: '1',
        university: 'ФИНКИ',
        priceSingle: 700,
        priceFull: 5500,
        hidden: true,
        lectures: [
          { id: 'oop1', title: 'Класи и објекти', date: '2026-03-03T14:00:00Z', duration: 90 },
          { id: 'oop2', title: 'Наследување', date: '2026-03-06T14:00:00Z', duration: 90 }
        ]
      },
      {
        id: 'math-1',
        title: 'Математика 1 / Калкулус',
        code: 'МАТ-1 / К',
        description: 'Калкулус е математика на промената. Прво ги анализираш функциите до нивните крајни граници, па со изводи мериш колку брзо се менуваат работите во секој момент. На крај, со интегралите го правиш обратното – ги собираш сите ситни делови за да добиеш целина. Тоа е алатката со која се опишува целиот физички свет.',
        image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=1350&q=80', // Calculus/Math theme
        professorId: '2',
        university: 'ФИНКИ',
        priceSingle: 750,
        priceFull: 6000,
        lectures: [
          { id: 'm1l1', title: 'Функции дел I, и наоѓање домен на функција', date: '2026-03-02T10:00:00Z', duration: 90 },
          { id: 'm1l2', title: 'Функции дел II и домен на сложена функција', date: '2026-03-05T10:00:00Z', duration: 90 },
          { id: 'm1l3', title: 'Фамилии функции и инверзна функција', date: '2026-03-09T10:00:00Z', duration: 90 },
          { id: 'm1l4', title: 'Експоненцијални и логаритамски функции', date: '2026-03-12T10:00:00Z', duration: 90 },
          { id: 'm1l5', title: 'Лимеси, интуитивна дефиниција и пресметување', date: '2026-03-16T10:00:00Z', duration: 90 },
          { id: 'm1l6', title: 'Докажување на лимеси со формална математичка дефиниција', date: '2026-03-19T10:00:00Z', duration: 90 },
          { id: 'm1l7', title: 'Непрекинатост', date: '2026-03-23T10:00:00Z', duration: 90 },
          { id: 'm1l8', title: 'Поим на извод, техники на диференцирање', date: '2026-03-26T10:00:00Z', duration: 90 },
          { id: 'm1l9', title: 'Имплицитно и логаритамско диференцирање', date: '2026-03-30T10:00:00Z', duration: 90 },
          { id: 'm1l10', title: 'Лопиталово правило', date: '2026-04-02T10:00:00Z', duration: 90 },
          { id: 'm1l11', title: 'Испитување тек и скицирање график на функција I', date: '2026-04-06T10:00:00Z', duration: 90 },
          { id: 'm1l12', title: 'Испитување тек и скицирање график на функција II', date: '2026-04-09T10:00:00Z', duration: 90 },
          { id: 'm1l13', title: 'Неопределен интеграл', date: '2026-04-13T10:00:00Z', duration: 90 },
          { id: 'm1l14', title: 'Метод на замена', date: '2026-04-16T10:00:00Z', duration: 90 },
          { id: 'm1l15', title: 'Парцијална интеграција', date: '2026-04-20T10:00:00Z', duration: 90 },
          { id: 'm1l16', title: 'Определен интеграл и несвојстен интеграл', date: '2026-04-23T10:00:00Z', duration: 90 },
          { id: 'm1l17', title: 'Фундаментална теорема на калкулус', date: '2026-04-27T10:00:00Z', duration: 90 }
        ]
      }
    ];
    setCourses(mockCourses);
  }, []);

  return (
    <DataContext.Provider value={{ 
      courses,
      landingPageData,
      professors
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => useContext(DataContext);

-- ============================================
-- Bilingual Support Migration
-- Adds English columns to courses and curriculum_items
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. Add English columns to courses
alter table courses add column if not exists title_en text;
alter table courses add column if not exists description_en text;

-- 2. Add English columns to curriculum_items
alter table curriculum_items add column if not exists title_en text;
alter table curriculum_items add column if not exists description_en text;

-- 3. Add English column to midterms
alter table midterms add column if not exists title_en text;

-- ============================================
-- Seed English translations for existing data
-- ============================================

-- Courses
UPDATE courses SET title_en = 'Structural Programming', description_en = 'The goal of this course is to introduce students to the paradigm of structural programming and to familiarize them with the basic concepts of algorithmic thinking and program development.' WHERE id = 'a1000000-0000-0000-0000-000000000001';

UPDATE courses SET title_en = 'Operating Systems', description_en = 'Operating Systems is one of the most important courses that gives you a look "under the hood" of computers. In this course we study in detail the concepts of process management, threads, memory, and file systems.' WHERE id = 'a1000000-0000-0000-0000-000000000002';

UPDATE courses SET title_en = 'Mathematics 2 / Discrete Mathematics', description_en = 'Discrete mathematics is the language of computer science. This subject is often a challenge for students, but through our lectures you will master the concepts of mathematical logic, set theory, functions, and proof methods.' WHERE id = 'a1000000-0000-0000-0000-000000000003';

UPDATE courses SET title_en = 'Algorithms and Data Structures', description_en = 'Algorithms and Data Structures (ADS) is a key course for every aspiring software engineer and a frequent topic in technical interviews. The course teaches you how to efficiently organize data and write optimized code.' WHERE id = 'a1000000-0000-0000-0000-000000000004';

UPDATE courses SET title_en = 'Object-Oriented Programming', description_en = 'Object-Oriented Programming (OOP) is a paradigm used in nearly every modern software project. Through C++, this course introduces you to the concepts of classes, objects, encapsulation, inheritance, and polymorphism.' WHERE id = 'a1000000-0000-0000-0000-000000000005';

UPDATE courses SET title_en = 'Mathematics 1 / Calculus', description_en = 'Calculus 1 (Mathematics 1) lays the mathematical foundations needed for engineering disciplines. The course covers detailed study of functions, limits, derivatives and their applications, as well as the basics of integral calculus.' WHERE id = 'a1000000-0000-0000-0000-000000000006';

-- Curriculum items: Structural Programming
UPDATE curriculum_items SET title_en = 'Introduction to Programming', description_en = 'Algorithms and programs. Concept of programming. Programming languages. Structural programming.' WHERE course_id = 'a1000000-0000-0000-0000-000000000001' AND sort_order = 1;
UPDATE curriculum_items SET title_en = 'C++ Basics', description_en = 'Algorithmic control structures. Values and data, variables, assignment operator.' WHERE course_id = 'a1000000-0000-0000-0000-000000000001' AND sort_order = 2;
UPDATE curriculum_items SET title_en = 'Data Types and Operators', description_en = 'Number representation in computers. Number ranges. Data types and their ranges.' WHERE course_id = 'a1000000-0000-0000-0000-000000000001' AND sort_order = 3;
UPDATE curriculum_items SET title_en = 'Selection Control Structures', description_en = 'if, if-else, conditional operator ?:, switch structure.' WHERE course_id = 'a1000000-0000-0000-0000-000000000001' AND sort_order = 4;
UPDATE curriculum_items SET title_en = 'Loop Control Structures', description_en = 'while loop, do-while loop, for loop. Nested loops.' WHERE course_id = 'a1000000-0000-0000-0000-000000000001' AND sort_order = 5;
UPDATE curriculum_items SET title_en = 'Functions', description_en = 'Function definition. Declaring and calling functions. Function parameters.' WHERE course_id = 'a1000000-0000-0000-0000-000000000001' AND sort_order = 6;
UPDATE curriculum_items SET title_en = 'Arrays', description_en = 'One-dimensional arrays. Array initialization. Accessing array elements.' WHERE course_id = 'a1000000-0000-0000-0000-000000000001' AND sort_order = 7;
UPDATE curriculum_items SET title_en = 'Recursion and Pointers', description_en = 'Concept of recursion. Recursive functions. Pointers.' WHERE course_id = 'a1000000-0000-0000-0000-000000000001' AND sort_order = 8;
UPDATE curriculum_items SET title_en = 'Matrices', description_en = 'Two-dimensional arrays (matrices). Matrix initialization. Basic matrix operations.' WHERE course_id = 'a1000000-0000-0000-0000-000000000001' AND sort_order = 9;
UPDATE curriculum_items SET title_en = 'Strings', description_en = 'Character arrays (char arrays). Working with text data. Standard string functions.' WHERE course_id = 'a1000000-0000-0000-0000-000000000001' AND sort_order = 10;

-- Curriculum items: Operating Systems
UPDATE curriculum_items SET title_en = 'Overview of Operating Systems', description_en = 'Definition of an operating system. Role of the operating system. History and evolution.' WHERE course_id = 'a1000000-0000-0000-0000-000000000002' AND sort_order = 1;
UPDATE curriculum_items SET title_en = 'Unix Commands and Shell Scripting', description_en = 'Introduction to Unix/Linux. Working with the terminal. Basic Unix commands. Shell scripting.' WHERE course_id = 'a1000000-0000-0000-0000-000000000002' AND sort_order = 2;
UPDATE curriculum_items SET title_en = 'Processes and Process Management', description_en = 'Process definition. Process lifecycle. Process states.' WHERE course_id = 'a1000000-0000-0000-0000-000000000002' AND sort_order = 3;
UPDATE curriculum_items SET title_en = 'Threads', description_en = 'Thread concept. Difference between process and thread. Thread management.' WHERE course_id = 'a1000000-0000-0000-0000-000000000002' AND sort_order = 4;
UPDATE curriculum_items SET title_en = 'Concurrency', description_en = 'Concurrent processes. Synchronization. Concurrency problems.' WHERE course_id = 'a1000000-0000-0000-0000-000000000002' AND sort_order = 5;
UPDATE curriculum_items SET title_en = 'Deadlock', description_en = 'Deadlock definition. Conditions for occurrence. Prevention and avoidance methods.' WHERE course_id = 'a1000000-0000-0000-0000-000000000002' AND sort_order = 6;
UPDATE curriculum_items SET title_en = 'Memory Management', description_en = 'Types of memory devices. Memory management techniques. Partitioning.' WHERE course_id = 'a1000000-0000-0000-0000-000000000002' AND sort_order = 7;
UPDATE curriculum_items SET title_en = 'File Systems', description_en = 'Basic concepts of file systems. Directory structure.' WHERE course_id = 'a1000000-0000-0000-0000-000000000002' AND sort_order = 8;
UPDATE curriculum_items SET title_en = 'Docker and Containerization', description_en = 'Containerization concept. Docker architecture. Docker Engine, images, containers.' WHERE course_id = 'a1000000-0000-0000-0000-000000000002' AND sort_order = 9;

-- Curriculum items: Discrete Mathematics
UPDATE curriculum_items SET title_en = 'Propositions, Logical Operations and Laws', description_en = 'Basic concepts of propositional logic, truth values, and logical operations.' WHERE course_id = 'a1000000-0000-0000-0000-000000000003' AND sort_order = 1;
UPDATE curriculum_items SET title_en = 'Predicates and Quantifiers', description_en = 'Introduction to predicate logic, universal and existential quantifiers.' WHERE course_id = 'a1000000-0000-0000-0000-000000000003' AND sort_order = 2;
UPDATE curriculum_items SET title_en = 'Methods of Inference', description_en = 'Rules of inference, direct proof, proof by contradiction.' WHERE course_id = 'a1000000-0000-0000-0000-000000000003' AND sort_order = 3;
UPDATE curriculum_items SET title_en = 'Set Theory', description_en = 'Definition of sets, subsets, power set, and basic operations.' WHERE course_id = 'a1000000-0000-0000-0000-000000000003' AND sort_order = 4;
UPDATE curriculum_items SET title_en = 'Functions: Injections, Surjections, and Bijections', description_en = 'Function definition, domain, codomain, inverse functions, and composition.' WHERE course_id = 'a1000000-0000-0000-0000-000000000003' AND sort_order = 5;
UPDATE curriculum_items SET title_en = 'Mathematical Induction', description_en = 'Principle of mathematical induction and its application in proofs.' WHERE course_id = 'a1000000-0000-0000-0000-000000000003' AND sort_order = 6;
UPDATE curriculum_items SET title_en = 'Recurrence Relations', description_en = 'Defining sequences through recurrence relations and solving them.' WHERE course_id = 'a1000000-0000-0000-0000-000000000003' AND sort_order = 7;

-- Curriculum items: Algorithms and Data Structures
UPDATE curriculum_items SET title_en = 'Introduction to Data Structures and Algorithms', description_en = 'Concept of data structures. Static and dynamic data types.' WHERE course_id = 'a1000000-0000-0000-0000-000000000004' AND sort_order = 1;
UPDATE curriculum_items SET title_en = 'Algorithm Analysis', description_en = 'RAM model. Algorithm comparison. Time and space complexity. Big-O notation.' WHERE course_id = 'a1000000-0000-0000-0000-000000000004' AND sort_order = 2;
UPDATE curriculum_items SET title_en = 'Stacks', description_en = 'Stack definition. Stack operations. Algorithms with stacks.' WHERE course_id = 'a1000000-0000-0000-0000-000000000004' AND sort_order = 3;
UPDATE curriculum_items SET title_en = 'Linked Lists', description_en = 'Types of linked lists. Algorithms with linked lists.' WHERE course_id = 'a1000000-0000-0000-0000-000000000004' AND sort_order = 4;
UPDATE curriculum_items SET title_en = 'Queues', description_en = 'Queue definition. Queue operations. Types of queues.' WHERE course_id = 'a1000000-0000-0000-0000-000000000004' AND sort_order = 5;
UPDATE curriculum_items SET title_en = 'Hash Structures', description_en = 'Hashing concept. Hash functions. Hash tables. Collision resolution techniques.' WHERE course_id = 'a1000000-0000-0000-0000-000000000004' AND sort_order = 6;
UPDATE curriculum_items SET title_en = 'Trees', description_en = 'Tree definition. Binary search trees. Operations.' WHERE course_id = 'a1000000-0000-0000-0000-000000000004' AND sort_order = 7;
UPDATE curriculum_items SET title_en = 'Searching and Sorting', description_en = 'Sequential and binary search. Sorting algorithms.' WHERE course_id = 'a1000000-0000-0000-0000-000000000004' AND sort_order = 8;
UPDATE curriculum_items SET title_en = 'Graphs', description_en = 'Basic graph concepts. BFS, DFS. Topological sorting.' WHERE course_id = 'a1000000-0000-0000-0000-000000000004' AND sort_order = 9;

-- Curriculum items: Object-Oriented Programming
UPDATE curriculum_items SET title_en = 'Programming Paradigm Fundamentals', description_en = 'Concept of programming paradigm. Types of programming paradigms.' WHERE course_id = 'a1000000-0000-0000-0000-000000000005' AND sort_order = 1;
UPDATE curriculum_items SET title_en = 'Working with Classes and Objects', description_en = 'Method implementation. Constructors, destructors.' WHERE course_id = 'a1000000-0000-0000-0000-000000000005' AND sort_order = 2;
UPDATE curriculum_items SET title_en = 'Inheritance', description_en = 'Inheritance basics. Multiple inheritance. Conversion.' WHERE course_id = 'a1000000-0000-0000-0000-000000000005' AND sort_order = 3;
UPDATE curriculum_items SET title_en = 'Polymorphism', description_en = 'Concept of polymorphism. Application in object-oriented programming.' WHERE course_id = 'a1000000-0000-0000-0000-000000000005' AND sort_order = 4;
UPDATE curriculum_items SET title_en = 'Abstraction', description_en = 'Abstract classes. Interfaces.' WHERE course_id = 'a1000000-0000-0000-0000-000000000005' AND sort_order = 5;
UPDATE curriculum_items SET title_en = 'Error Handling', description_en = 'Exceptions. Error handling mechanisms.' WHERE course_id = 'a1000000-0000-0000-0000-000000000005' AND sort_order = 6;

-- Curriculum items: Calculus
UPDATE curriculum_items SET title_en = 'Functions and Their Properties', description_en = 'Overview of basic function classes, domain, codomain, inverse functions.' WHERE course_id = 'a1000000-0000-0000-0000-000000000006' AND sort_order = 1;
UPDATE curriculum_items SET title_en = 'Limits and Continuity', description_en = 'Concept of limits, calculating limits, and continuity.' WHERE course_id = 'a1000000-0000-0000-0000-000000000006' AND sort_order = 2;
UPDATE curriculum_items SET title_en = 'Derivatives and Differentiation Techniques', description_en = 'Definition of derivative, tabular derivatives, differentiation rules.' WHERE course_id = 'a1000000-0000-0000-0000-000000000006' AND sort_order = 3;
UPDATE curriculum_items SET title_en = 'Applications of Derivatives', description_en = "L'Hôpital's rule, finding extrema, monotonicity, and graph sketching." WHERE course_id = 'a1000000-0000-0000-0000-000000000006' AND sort_order = 4;
UPDATE curriculum_items SET title_en = 'Indefinite Integrals', description_en = 'Concept of antiderivative, tabular integrals, substitution method.' WHERE course_id = 'a1000000-0000-0000-0000-000000000006' AND sort_order = 5;
UPDATE curriculum_items SET title_en = 'Definite Integrals and Applications', description_en = 'Newton-Leibniz formula and area calculation.' WHERE course_id = 'a1000000-0000-0000-0000-000000000006' AND sort_order = 6;
UPDATE curriculum_items SET title_en = 'Improper Integrals', description_en = 'Integration of functions with infinite bounds or discontinuities.' WHERE course_id = 'a1000000-0000-0000-0000-000000000006' AND sort_order = 7;

-- Midterms
UPDATE midterms SET title_en = 'First Midterm' WHERE course_id = 'a1000000-0000-0000-0000-000000000004' AND title = 'First Midterm';
UPDATE midterms SET title_en = 'Second Midterm' WHERE course_id = 'a1000000-0000-0000-0000-000000000004' AND title = 'Second Midterm';

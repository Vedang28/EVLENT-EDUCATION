-- Seed data for local development
-- Run: npx supabase db reset (applies migrations + this seed file)

-- IDs (from local DB after reset + user creation)
-- Teacher: 29e214ba-a4c1-488d-851b-4f53aeedb968
-- Student: d6f4352f-00bc-471f-83dc-10207c71288b
-- Admin:   d7b87dbe-4ec1-4ab6-bd90-0cbc240e3d2a
-- Subjects: Mathematics=63abaf99-..., Physics=048f7c6d-..., CS=005fc334-...
-- Grade: Class 10 = 49f18b55-...

-- ===== Assign student grade level =====
UPDATE public.profiles
SET grade_level_id = (SELECT id FROM public.grade_levels WHERE name = 'Class 10')
WHERE email = 'student@test.com';

-- ===== Courses =====
INSERT INTO public.courses (id, title, description, teacher_id, status, subject_id, grade_level_id) VALUES
  ('c0000001-0000-0000-0000-000000000001',
   'Algebra Fundamentals',
   'Master the foundations of algebra — equations, inequalities, polynomials, and functions. Designed for Class 10 students preparing for board exams.',
   '29e214ba-a4c1-488d-851b-4f53aeedb968', 'approved',
   (SELECT id FROM public.subjects WHERE name = 'Mathematics'),
   (SELECT id FROM public.grade_levels WHERE name = 'Class 10')),

  ('c0000001-0000-0000-0000-000000000002',
   'Mechanics & Motion',
   'Explore Newton''s laws, kinematics, friction, and energy. Includes problem sets and video demonstrations.',
   '29e214ba-a4c1-488d-851b-4f53aeedb968', 'approved',
   (SELECT id FROM public.subjects WHERE name = 'Physics'),
   (SELECT id FROM public.grade_levels WHERE name = 'Class 10')),

  ('c0000001-0000-0000-0000-000000000003',
   'Python Programming',
   'Learn Python from scratch — variables, loops, functions, and data structures. Hands-on coding assignments every week.',
   '29e214ba-a4c1-488d-851b-4f53aeedb968', 'approved',
   (SELECT id FROM public.subjects WHERE name = 'Computer Science'),
   (SELECT id FROM public.grade_levels WHERE name = 'Class 10'));

-- ===== Modules =====
INSERT INTO public.modules (id, course_id, title, position) VALUES
  ('a0000010-0000-0000-0000-000000000001', 'c0000001-0000-0000-0000-000000000001', 'Linear Equations', 0),
  ('a0000010-0000-0000-0000-000000000002', 'c0000001-0000-0000-0000-000000000001', 'Polynomials', 1),
  ('a0000010-0000-0000-0000-000000000003', 'c0000001-0000-0000-0000-000000000002', 'Kinematics', 0),
  ('a0000010-0000-0000-0000-000000000004', 'c0000001-0000-0000-0000-000000000002', 'Newton''s Laws', 1),
  ('a0000010-0000-0000-0000-000000000005', 'c0000001-0000-0000-0000-000000000003', 'Getting Started', 0),
  ('a0000010-0000-0000-0000-000000000006', 'c0000001-0000-0000-0000-000000000003', 'Control Flow & Functions', 1);

-- ===== Lessons =====
INSERT INTO public.lessons (id, module_id, title, content, video_url, position) VALUES
  -- Algebra: Linear Equations
  ('b0000010-0000-0000-0000-000000000001', 'a0000010-0000-0000-0000-000000000001',
   'Solving Linear Equations',
   '<h2>What is a Linear Equation?</h2><p>A linear equation is an equation of the form <strong>ax + b = 0</strong>, where a and b are constants and x is the variable.</p><h3>Steps to Solve</h3><ol><li>Isolate the variable on one side</li><li>Simplify both sides</li><li>Check your solution by substituting back</li></ol><p>Example: Solve <strong>3x + 5 = 14</strong></p><ul><li>Subtract 5: 3x = 9</li><li>Divide by 3: x = 3</li></ul>',
   'https://www.youtube.com/embed/GmMX3-nTWbE', 0),

  ('b0000010-0000-0000-0000-000000000002', 'a0000010-0000-0000-0000-000000000001',
   'Word Problems with Linear Equations',
   '<h2>Translating Words to Equations</h2><p>The key skill is turning a real-world problem into a mathematical equation.</p><p><strong>Common phrases:</strong></p><ul><li>"is" → equals (=)</li><li>"more than" → addition (+)</li><li>"less than" → subtraction (−)</li><li>"times" → multiplication (×)</li></ul><blockquote>Practice tip: always define your variable first before writing the equation.</blockquote>',
   NULL, 1),

  -- Algebra: Polynomials
  ('b0000010-0000-0000-0000-000000000003', 'a0000010-0000-0000-0000-000000000002',
   'Introduction to Polynomials',
   '<h2>Polynomials</h2><p>A polynomial is an expression with one or more terms, where each term has a coefficient and a variable raised to a non-negative integer power.</p><p>Examples:</p><ul><li><strong>3x² + 2x − 5</strong> (quadratic, degree 2)</li><li><strong>x³ − 4x</strong> (cubic, degree 3)</li></ul><h3>Key Terminology</h3><p><strong>Degree:</strong> the highest power of the variable<br/><strong>Leading coefficient:</strong> the coefficient of the highest-degree term</p>',
   'https://www.youtube.com/embed/ffLLmV4mZwU', 0),

  ('b0000010-0000-0000-0000-000000000004', 'a0000010-0000-0000-0000-000000000002',
   'Factoring Polynomials',
   '<h2>Factoring Techniques</h2><p>Factoring means writing a polynomial as a product of simpler expressions.</p><h3>Common Methods</h3><ol><li><strong>Common factor:</strong> 6x² + 3x = 3x(2x + 1)</li><li><strong>Difference of squares:</strong> x² − 9 = (x+3)(x−3)</li><li><strong>Trinomial:</strong> x² + 5x + 6 = (x+2)(x+3)</li></ol>',
   NULL, 1),

  -- Physics: Kinematics
  ('b0000010-0000-0000-0000-000000000005', 'a0000010-0000-0000-0000-000000000003',
   'Distance, Speed, and Velocity',
   '<h2>Kinematics Basics</h2><p>Kinematics is the study of motion without considering its causes.</p><h3>Key Quantities</h3><ul><li><strong>Distance:</strong> total path length (scalar)</li><li><strong>Displacement:</strong> shortest path from start to end (vector)</li><li><strong>Speed:</strong> distance / time</li><li><strong>Velocity:</strong> displacement / time</li></ul><p>Units: metres per second (m/s)</p>',
   'https://www.youtube.com/embed/ZM8ECpBuQYE', 0),

  ('b0000010-0000-0000-0000-000000000006', 'a0000010-0000-0000-0000-000000000003',
   'Equations of Motion',
   '<h2>The Three Equations of Motion</h2><p>For uniformly accelerated motion in a straight line:</p><ol><li><strong>v = u + at</strong></li><li><strong>s = ut + ½at²</strong></li><li><strong>v² = u² + 2as</strong></li></ol><p>Where: u = initial velocity, v = final velocity, a = acceleration, t = time, s = displacement.</p>',
   'https://www.youtube.com/embed/v_WBxmSW9CM', 1),

  -- Physics: Newton's Laws
  ('b0000010-0000-0000-0000-000000000007', 'a0000010-0000-0000-0000-000000000004',
   'Newton''s First Law — Inertia',
   '<h2>The Law of Inertia</h2><p>An object at rest stays at rest, and an object in motion stays in motion at constant velocity, <strong>unless acted upon by a net external force</strong>.</p><p>Examples of inertia in daily life:</p><ul><li>Passengers lurch forward when a bus stops suddenly</li><li>A ball rolling on a frictionless surface would never stop</li><li>Seat belts protect us from our own inertia</li></ul>',
   NULL, 0),

  ('b0000010-0000-0000-0000-000000000008', 'a0000010-0000-0000-0000-000000000004',
   'Newton''s Second Law — F = ma',
   '<h2>Force, Mass, and Acceleration</h2><p>The net force on an object equals its mass times its acceleration:</p><p><strong>F = ma</strong></p><h3>Worked Example</h3><p>A 5 kg box is pushed with a force of 20 N. What is the acceleration?</p><p>a = F/m = 20/5 = <strong>4 m/s²</strong></p>',
   'https://www.youtube.com/embed/kKKM8Y-u7ds', 1),

  -- Python: Getting Started
  ('b0000010-0000-0000-0000-000000000009', 'a0000010-0000-0000-0000-000000000005',
   'Hello World & Variables',
   '<h2>Your First Python Program</h2><pre><code>print("Hello, World!")</code></pre><p>Variables in Python are created when you assign a value:</p><pre><code>name = "Alice"
age = 15
height = 5.4
print(f"My name is {name}, I am {age} years old")</code></pre><h3>Data Types</h3><ul><li><strong>str</strong> — text: "hello"</li><li><strong>int</strong> — whole numbers: 42</li><li><strong>float</strong> — decimals: 3.14</li><li><strong>bool</strong> — True or False</li></ul>',
   'https://www.youtube.com/embed/kqtD5dpn9C8', 0),

  ('b0000010-0000-0000-0000-000000000010', 'a0000010-0000-0000-0000-000000000005',
   'Input and Output',
   '<h2>Getting User Input</h2><pre><code>name = input("What is your name? ")
print("Hello, " + name + "!")</code></pre><p>The <strong>input()</strong> function always returns a string. To use it as a number:</p><pre><code>age = int(input("Enter your age: "))
print("Next year you will be", age + 1)</code></pre>',
   NULL, 1),

  -- Python: Control Flow
  ('b0000010-0000-0000-0000-000000000011', 'a0000010-0000-0000-0000-000000000006',
   'If-Else and Loops',
   '<h2>Conditional Statements</h2><pre><code>score = 85
if score >= 90:
    print("Grade: A")
elif score >= 80:
    print("Grade: B")
else:
    print("Grade: C")</code></pre><h2>Loops</h2><h3>For loop</h3><pre><code>for i in range(5):
    print(i)  # prints 0, 1, 2, 3, 4</code></pre><h3>While loop</h3><pre><code>count = 0
while count < 3:
    print(count)
    count += 1</code></pre>',
   'https://www.youtube.com/embed/Zp5MuPOtsSY', 0),

  ('b0000010-0000-0000-0000-000000000012', 'a0000010-0000-0000-0000-000000000006',
   'Functions',
   '<h2>Defining Functions</h2><p>Functions let you organize and reuse code:</p><pre><code>def greet(name):
    return f"Hello, {name}!"

message = greet("Alice")
print(message)  # Hello, Alice!</code></pre><h3>Parameters vs Arguments</h3><ul><li><strong>Parameter:</strong> the variable in the function definition (name)</li><li><strong>Argument:</strong> the value passed when calling (\"Alice\")</li></ul>',
   NULL, 1);

-- ===== Assignments =====
INSERT INTO public.assignments (id, course_id, title, description, deadline, max_score) VALUES
  ('a0000001-0000-0000-0000-000000000001', 'c0000001-0000-0000-0000-000000000001',
   'Linear Equations Problem Set',
   'Solve the 10 linear equations provided. Show all working steps.',
   (NOW() + interval '5 days')::timestamptz, 50),

  ('a0000001-0000-0000-0000-000000000002', 'c0000001-0000-0000-0000-000000000001',
   'Polynomial Factoring Worksheet',
   'Factor each polynomial completely. There are 8 problems.',
   (NOW() + interval '12 days')::timestamptz, 40),

  ('a0000001-0000-0000-0000-000000000003', 'c0000001-0000-0000-0000-000000000002',
   'Kinematics Practice Problems',
   'Use the equations of motion to solve 6 problems involving uniformly accelerated motion.',
   (NOW() + interval '7 days')::timestamptz, 60),

  ('a0000001-0000-0000-0000-000000000004', 'c0000001-0000-0000-0000-000000000003',
   'Python Functions Assignment',
   'Write 5 Python functions as described in the attached PDF. Upload your .py file.',
   (NOW() + interval '10 days')::timestamptz, 100);

-- ===== Live Classes =====
INSERT INTO public.live_classes (id, course_id, teacher_id, title, meeting_url, start_time) VALUES
  -- 2 upcoming
  ('cc000001-0000-0000-0000-000000000001', 'c0000001-0000-0000-0000-000000000001',
   '29e214ba-a4c1-488d-851b-4f53aeedb968',
   'Algebra Doubt Clearing Session',
   'https://meet.google.com/abc-defg-hij',
   (NOW() + interval '2 days')::timestamptz),

  ('cc000001-0000-0000-0000-000000000002', 'c0000001-0000-0000-0000-000000000002',
   '29e214ba-a4c1-488d-851b-4f53aeedb968',
   'Physics Problem Solving Workshop',
   'https://meet.google.com/xyz-uvwx-yz1',
   (NOW() + interval '4 days')::timestamptz),

  -- 2 past
  ('cc000001-0000-0000-0000-000000000003', 'c0000001-0000-0000-0000-000000000001',
   '29e214ba-a4c1-488d-851b-4f53aeedb968',
   'Introduction to Algebra',
   'https://meet.google.com/past-111-aaa',
   (NOW() - interval '3 days')::timestamptz),

  ('cc000001-0000-0000-0000-000000000004', 'c0000001-0000-0000-0000-000000000003',
   '29e214ba-a4c1-488d-851b-4f53aeedb968',
   'Python Setup & Hello World',
   'https://meet.google.com/past-222-bbb',
   (NOW() - interval '5 days')::timestamptz);

-- ===== Enrollments =====
INSERT INTO public.enrollments (student_id, course_id) VALUES
  ('d6f4352f-00bc-471f-83dc-10207c71288b', 'c0000001-0000-0000-0000-000000000001'),
  ('d6f4352f-00bc-471f-83dc-10207c71288b', 'c0000001-0000-0000-0000-000000000002'),
  ('d6f4352f-00bc-471f-83dc-10207c71288b', 'c0000001-0000-0000-0000-000000000003');

-- ===== Quizzes =====
INSERT INTO public.quizzes (id, course_id, title, description, time_limit, attempt_limit, randomize, show_answers) VALUES
  ('d0000001-0000-0000-0000-000000000001', 'c0000001-0000-0000-0000-000000000001',
   'Linear Equations Quiz',
   'Test your understanding of solving linear equations and word problems.',
   15, 2, false, true),

  ('d0000001-0000-0000-0000-000000000002', 'c0000001-0000-0000-0000-000000000002',
   'Kinematics Quiz',
   'Questions on distance, speed, velocity and equations of motion.',
   20, 2, true, true),

  ('d0000001-0000-0000-0000-000000000003', 'c0000001-0000-0000-0000-000000000003',
   'Python Basics Quiz',
   'Variables, data types, input/output, and control flow.',
   10, 3, false, true);

-- ===== Quiz Questions =====
-- Algebra quiz
INSERT INTO public.quiz_questions (quiz_id, type, question_text, options, correct_answer, points, position) VALUES
  ('d0000001-0000-0000-0000-000000000001', 'mcq',
   'What is the solution of 2x + 6 = 14?',
   '["x = 2", "x = 4", "x = 6", "x = 8"]'::jsonb,
   '1'::jsonb, 2, 0),

  ('d0000001-0000-0000-0000-000000000001', 'mcq',
   'Which of these is a linear equation?',
   '["x² + 2 = 0", "3x + 5 = 11", "x³ = 27", "1/x = 4"]'::jsonb,
   '1'::jsonb, 1, 1),

  ('d0000001-0000-0000-0000-000000000001', 'true_false',
   'The equation 5x - 10 = 0 has the solution x = 2.',
   NULL,
   'true'::jsonb, 1, 2),

  ('d0000001-0000-0000-0000-000000000001', 'fill_blank',
   'Solve for x: 3x = 21. x = ___',
   NULL,
   '"7"'::jsonb, 2, 3),

  ('d0000001-0000-0000-0000-000000000001', 'mcq',
   'If a number increased by 5 equals 18, what is the number?',
   '["12", "13", "14", "15"]'::jsonb,
   '1'::jsonb, 2, 4);

-- Physics quiz
INSERT INTO public.quiz_questions (quiz_id, type, question_text, options, correct_answer, points, position) VALUES
  ('d0000001-0000-0000-0000-000000000002', 'mcq',
   'What is the SI unit of velocity?',
   '["m/s²", "m/s", "km/h", "N"]'::jsonb,
   '1'::jsonb, 1, 0),

  ('d0000001-0000-0000-0000-000000000002', 'true_false',
   'Distance is a vector quantity.',
   NULL,
   'false'::jsonb, 1, 1),

  ('d0000001-0000-0000-0000-000000000002', 'mcq',
   'Which equation of motion relates velocity, acceleration and displacement without time?',
   '["v = u + at", "s = ut + ½at²", "v² = u² + 2as", "s = vt"]'::jsonb,
   '2'::jsonb, 2, 2),

  ('d0000001-0000-0000-0000-000000000002', 'fill_blank',
   'A car accelerates from rest at 2 m/s² for 5 seconds. Its final velocity is ___ m/s.',
   NULL,
   '"10"'::jsonb, 2, 3);

-- Python quiz
INSERT INTO public.quiz_questions (quiz_id, type, question_text, options, correct_answer, points, position) VALUES
  ('d0000001-0000-0000-0000-000000000003', 'mcq',
   'What data type does input() return in Python?',
   '["int", "float", "str", "bool"]'::jsonb,
   '2'::jsonb, 1, 0),

  ('d0000001-0000-0000-0000-000000000003', 'true_false',
   'In Python, indentation is optional for if-else blocks.',
   NULL,
   'false'::jsonb, 1, 1),

  ('d0000001-0000-0000-0000-000000000003', 'mcq',
   'What is the output of: print(type(3.14))?',
   '["<class ''int''>", "<class ''float''>", "<class ''str''>", "<class ''number''>"]'::jsonb,
   '1'::jsonb, 1, 2),

  ('d0000001-0000-0000-0000-000000000003', 'fill_blank',
   'The keyword used to define a function in Python is ___.',
   NULL,
   '"def"'::jsonb, 2, 3),

  ('d0000001-0000-0000-0000-000000000003', 'mcq',
   'Which loop is best when you know the number of iterations?',
   '["while", "for", "do-while", "repeat"]'::jsonb,
   '1'::jsonb, 1, 4);

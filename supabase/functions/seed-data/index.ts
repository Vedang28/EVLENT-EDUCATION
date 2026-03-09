import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const password = "Demo1234!";
    const results: string[] = [];

    // Helper to create user
    async function createUser(email: string, name: string) {
      const { data: existing } = await supabase.auth.admin.listUsers();
      const found = existing?.users?.find((u: any) => u.email === email);
      if (found) {
        results.push(`User ${email} already exists`);
        return found.id;
      }
      const { data, error } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { name },
      });
      if (error) throw new Error(`Failed to create ${email}: ${error.message}`);
      results.push(`Created user ${email}`);
      return data.user.id;
    }

    // 1. Create admin
    const adminId = await createUser("admin@learnhub.demo", "Admin User");
    // Set admin role
    const { data: existingAdminRole } = await supabase
      .from("user_roles")
      .select("id")
      .eq("user_id", adminId)
      .eq("role", "admin")
      .maybeSingle();
    if (!existingAdminRole) {
      await supabase.from("user_roles").insert({ user_id: adminId, role: "admin" });
      results.push("Assigned admin role");
    }

    // 2. Create teacher
    const teacherId = await createUser("teacher@learnhub.demo", "Sarah Johnson");
    const { data: existingTeacherRole } = await supabase
      .from("user_roles")
      .select("id")
      .eq("user_id", teacherId)
      .eq("role", "teacher")
      .maybeSingle();
    if (!existingTeacherRole) {
      await supabase.from("user_roles").insert({ user_id: teacherId, role: "teacher" });
      results.push("Assigned teacher role");
    }

    // 3. Create 20 students
    const studentIds: string[] = [];
    for (let i = 1; i <= 20; i++) {
      const num = String(i).padStart(2, "0");
      const id = await createUser(
        `student${num}@learnhub.demo`,
        `Student ${num}`
      );
      studentIds.push(id);
    }
    results.push(`Created/found 20 students`);

    // 4. Create 5 courses
    const courseDefs = [
      { title: "Web Development Fundamentals", description: "Learn HTML, CSS, and JavaScript from scratch. Build responsive websites and interactive web applications." },
      { title: "Python Programming Masterclass", description: "Master Python from basics to advanced topics including data structures, OOP, and automation." },
      { title: "UI/UX Design Principles", description: "Learn user-centered design, wireframing, prototyping, and usability testing." },
      { title: "Introduction to Machine Learning", description: "Explore supervised and unsupervised learning, neural networks, and real-world ML applications." },
      { title: "Digital Marketing Strategy", description: "Master SEO, social media marketing, email campaigns, and analytics-driven marketing." },
    ];

    const courseIds: string[] = [];
    for (const def of courseDefs) {
      const { data: existing } = await supabase
        .from("courses")
        .select("id")
        .eq("title", def.title)
        .maybeSingle();
      if (existing) {
        courseIds.push(existing.id);
        continue;
      }
      const { data, error } = await supabase
        .from("courses")
        .insert({
          title: def.title,
          description: def.description,
          teacher_id: teacherId,
          status: "approved",
        })
        .select("id")
        .single();
      if (error) throw new Error(`Course insert failed: ${error.message}`);
      courseIds.push(data.id);
      results.push(`Created course: ${def.title}`);
    }

    // 5. Create modules & lessons per course
    const moduleNames = [
      ["Getting Started", "Core Concepts"],
      ["Python Basics", "Advanced Python"],
      ["Design Foundations", "Prototyping"],
      ["ML Fundamentals", "Applied ML"],
      ["Marketing Basics", "Advanced Strategy"],
    ];

    const lessonTemplates = [
      ["Introduction", "Setup & Tools", "First Steps", "Practice Exercise"],
      ["Deep Dive", "Hands-On Project", "Best Practices", "Review & Quiz"],
    ];

    for (let ci = 0; ci < courseIds.length; ci++) {
      const courseId = courseIds[ci];
      for (let mi = 0; mi < 2; mi++) {
        const { data: existingMod } = await supabase
          .from("modules")
          .select("id")
          .eq("course_id", courseId)
          .eq("title", moduleNames[ci][mi])
          .maybeSingle();
        
        let moduleId: string;
        if (existingMod) {
          moduleId = existingMod.id;
        } else {
          const { data, error } = await supabase
            .from("modules")
            .insert({ course_id: courseId, title: moduleNames[ci][mi], position: mi + 1 })
            .select("id")
            .single();
          if (error) throw new Error(`Module insert failed: ${error.message}`);
          moduleId = data.id;
        }

        // Lessons
        for (let li = 0; li < 4; li++) {
          const lessonTitle = `${lessonTemplates[mi][li]}`;
          const { data: existingLesson } = await supabase
            .from("lessons")
            .select("id")
            .eq("module_id", moduleId)
            .eq("title", lessonTitle)
            .maybeSingle();
          if (!existingLesson) {
            await supabase.from("lessons").insert({
              module_id: moduleId,
              title: lessonTitle,
              position: li + 1,
              content: `Content for ${lessonTitle} in ${moduleNames[ci][mi]}.`,
            });
          }
        }
      }

      // Assignments per course
      const assignmentTitles = [`${courseDefs[ci].title} - Quiz 1`, `${courseDefs[ci].title} - Project`];
      for (let ai = 0; ai < 2; ai++) {
        const { data: existingAssign } = await supabase
          .from("assignments")
          .select("id")
          .eq("course_id", courseId)
          .eq("title", assignmentTitles[ai])
          .maybeSingle();
        if (!existingAssign) {
          await supabase.from("assignments").insert({
            course_id: courseId,
            title: assignmentTitles[ai],
            description: `Complete this ${ai === 0 ? "quiz" : "project"} to test your knowledge.`,
            max_score: ai === 0 ? 50 : 100,
            deadline: new Date(Date.now() + (14 + ai * 7) * 86400000).toISOString(),
          });
        }
      }
    }
    results.push("Created modules, lessons, and assignments");

    // 6. Enroll students (each student in 2-3 courses)
    for (let si = 0; si < studentIds.length; si++) {
      const numCourses = 2 + (si % 2);
      for (let ci = 0; ci < numCourses; ci++) {
        const courseId = courseIds[(si + ci) % courseIds.length];
        const { data: existing } = await supabase
          .from("enrollments")
          .select("id")
          .eq("student_id", studentIds[si])
          .eq("course_id", courseId)
          .maybeSingle();
        if (!existing) {
          await supabase.from("enrollments").insert({
            student_id: studentIds[si],
            course_id: courseId,
          });
        }
      }
    }
    results.push("Enrolled students in courses");

    // 7. Create some sample submissions
    const { data: allAssignments } = await supabase.from("assignments").select("id, course_id");
    if (allAssignments && allAssignments.length > 0) {
      let subCount = 0;
      for (let si = 0; si < Math.min(8, studentIds.length); si++) {
        const assignment = allAssignments[si % allAssignments.length];
        const { data: existingSub } = await supabase
          .from("submissions")
          .select("id")
          .eq("student_id", studentIds[si])
          .eq("assignment_id", assignment.id)
          .maybeSingle();
        if (!existingSub) {
          const graded = si < 5;
          await supabase.from("submissions").insert({
            student_id: studentIds[si],
            assignment_id: assignment.id,
            text_response: `This is a sample submission from Student ${String(si + 1).padStart(2, "0")}.`,
            grade: graded ? 60 + (si * 7) % 40 : null,
            feedback: graded ? "Good work! Keep it up." : null,
            graded_at: graded ? new Date().toISOString() : null,
          });
          subCount++;
        }
      }
      results.push(`Created ${subCount} sample submissions`);
    }

    return new Response(
      JSON.stringify({ success: true, results, credentials: { password, admin: "admin@learnhub.demo", teacher: "teacher@learnhub.demo", students: "student01-20@learnhub.demo" } }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

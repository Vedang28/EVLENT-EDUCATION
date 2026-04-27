import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useQuizQuestions } from "@/hooks/useQuizQuestions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle2, XCircle, MinusCircle } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type QuizRow = Database["public"]["Tables"]["quizzes"]["Row"];
type AttemptRow = Database["public"]["Tables"]["quiz_attempts"]["Row"];
type QuestionRow = Database["public"]["Tables"]["quiz_questions"]["Row"];

export default function QuizResults() {
  const { courseId, quizId, attemptId } = useParams();

  const { data: quiz } = useQuery({
    queryKey: ["quiz", quizId],
    queryFn: async () => {
      const { data } = await supabase.from("quizzes").select("*").eq("id", quizId!).single();
      return data as QuizRow | null;
    },
    enabled: !!quizId,
  });

  const { data: attempt } = useQuery({
    queryKey: ["quiz-attempt", attemptId],
    queryFn: async () => {
      const { data } = await supabase.from("quiz_attempts").select("*").eq("id", attemptId!).single();
      return data as AttemptRow | null;
    },
    enabled: !!attemptId,
  });

  const { data: questions } = useQuizQuestions(quizId);

  if (!quiz || !attempt || !questions) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  const answers = (attempt.answers ?? {}) as Record<string, number | boolean | string>;
  const scorePercent = attempt.max_score > 0 ? Math.round((Number(attempt.score ?? 0) / attempt.max_score) * 100) : 0;

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <Link to={`/courses/${courseId}`} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to course
      </Link>

      {/* Score Summary */}
      <Card>
        <CardHeader>
          <CardTitle>{quiz.title} — Results</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary">{Number(attempt.score ?? 0)}</div>
              <div className="text-sm text-muted-foreground">out of {attempt.max_score}</div>
            </div>
            <div className="flex-1">
              <Progress value={scorePercent} className="h-3" />
              <p className="text-sm text-muted-foreground mt-1">{scorePercent}%</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 text-sm">
            <Badge variant={scorePercent >= 80 ? "default" : scorePercent >= 50 ? "secondary" : "destructive"}>
              {scorePercent >= 80 ? "Excellent" : scorePercent >= 50 ? "Passing" : "Needs Improvement"}
            </Badge>
            <Badge variant="outline">
              {Object.keys(answers).length}/{questions.length} answered
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Per-question breakdown */}
      {quiz.show_answers && (
        <div className="space-y-3">
          <h3 className="font-semibold text-lg">Question Breakdown</h3>
          {questions.map((q, i) => {
            const userAnswer = answers[q.id];
            const isCorrect = checkCorrect(q, userAnswer);
            const wasAnswered = userAnswer !== undefined;

            return (
              <Card key={q.id}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      {!wasAnswered ? (
                        <MinusCircle className="h-5 w-5 text-muted-foreground" />
                      ) : isCorrect ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      ) : (
                        <XCircle className="h-5 w-5 text-destructive" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">Q{i + 1}. {q.question_text}</p>

                      {q.type === "mcq" && q.options && (
                        <div className="mt-2 space-y-1">
                          {(q.options as string[]).map((opt, idx) => {
                            const isUserChoice = userAnswer === idx;
                            const isCorrectChoice = idx === (q.correct_answer as number);
                            return (
                              <div
                                key={idx}
                                className={`text-xs px-2 py-1.5 rounded ${
                                  isCorrectChoice
                                    ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 font-medium"
                                    : isUserChoice
                                    ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                                    : "text-muted-foreground"
                                }`}
                              >
                                {String.fromCharCode(65 + idx)}. {opt}
                                {isCorrectChoice && " ✓"}
                                {isUserChoice && !isCorrectChoice && " (your answer)"}
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {q.type === "true_false" && (
                        <div className="mt-1 text-xs">
                          <span className="text-muted-foreground">Your answer: </span>
                          <span className={isCorrect ? "text-green-600 font-medium" : "text-destructive font-medium"}>
                            {wasAnswered ? (userAnswer ? "True" : "False") : "Not answered"}
                          </span>
                          {!isCorrect && (
                            <span className="text-green-600 ml-2">
                              (Correct: {(q.correct_answer as boolean) ? "True" : "False"})
                            </span>
                          )}
                        </div>
                      )}

                      {q.type === "fill_blank" && (
                        <div className="mt-1 text-xs">
                          <span className="text-muted-foreground">Your answer: </span>
                          <span className={isCorrect ? "text-green-600 font-medium" : "text-destructive font-medium"}>
                            {wasAnswered ? String(userAnswer) : "Not answered"}
                          </span>
                          {!isCorrect && (
                            <span className="text-green-600 ml-2">
                              (Correct: {q.correct_answer as string})
                            </span>
                          )}
                        </div>
                      )}

                      <div className="mt-1 text-xs text-muted-foreground">
                        {isCorrect ? q.points : 0}/{q.points} points
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <div className="flex gap-3">
        <Button variant="outline" asChild>
          <Link to={`/courses/${courseId}`}>Back to Course</Link>
        </Button>
      </div>
    </div>
  );
}

function checkCorrect(question: QuestionRow, userAnswer: number | boolean | string | undefined): boolean {
  if (userAnswer === undefined) return false;

  if (question.type === "mcq") {
    return userAnswer === (question.correct_answer as number);
  }
  if (question.type === "true_false") {
    return userAnswer === (question.correct_answer as boolean);
  }
  if (question.type === "fill_blank") {
    return (
      typeof userAnswer === "string" &&
      userAnswer.trim().toLowerCase() === (question.correct_answer as string).trim().toLowerCase()
    );
  }
  return false;
}

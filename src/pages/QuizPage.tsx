import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useQuizQuestions } from "@/hooks/useQuizQuestions";
import { useQuizAttempts } from "@/hooks/useQuizAttempts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, Clock, Send, Loader2, AlertTriangle } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type QuizRow = Database["public"]["Tables"]["quizzes"]["Row"];
type QuestionRow = Database["public"]["Tables"]["quiz_questions"]["Row"];
type Answers = Record<string, number | boolean | string>;

function shuffleArray<T>(arr: T[], seed?: boolean): T[] {
  if (!seed) return arr;
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export default function QuizPage() {
  const { courseId, quizId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: quiz } = useQuery({
    queryKey: ["quiz", quizId],
    queryFn: async () => {
      const { data } = await supabase.from("quizzes").select("*").eq("id", quizId!).single();
      return data as QuizRow | null;
    },
    enabled: !!quizId,
  });

  const { data: rawQuestions } = useQuizQuestions(quizId);
  const { data: attempts } = useQuizAttempts(quizId, user?.id);

  const completedAttempts = attempts?.filter((a) => a.completed_at) ?? [];
  const canAttempt = quiz ? completedAttempts.length < quiz.attempt_limit : false;
  const inProgressAttempt = attempts?.find((a) => !a.completed_at) ?? null;

  const questions = useMemo(() => {
    if (!rawQuestions) return [];
    return shuffleArray(rawQuestions, quiz?.randomize ?? false);
  }, [rawQuestions, quiz?.randomize]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [attemptId, setAttemptId] = useState<string | null>(inProgressAttempt?.id ?? null);
  const [started, setStarted] = useState(!!inProgressAttempt);
  const [startedAt, setStartedAt] = useState<Date | null>(
    inProgressAttempt ? new Date(inProgressAttempt.started_at) : null
  );
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (inProgressAttempt) {
      setAttemptId(inProgressAttempt.id);
      setStarted(true);
      setStartedAt(new Date(inProgressAttempt.started_at));
      if (inProgressAttempt.answers && typeof inProgressAttempt.answers === "object") {
        setAnswers(inProgressAttempt.answers as Answers);
      }
    }
  }, [inProgressAttempt]);

  const startAttemptMutation = useMutation({
    mutationFn: async () => {
      const maxScore = questions.reduce((sum, q) => sum + q.points, 0);
      const { data, error } = await supabase
        .from("quiz_attempts")
        .insert({ quiz_id: quizId!, student_id: user!.id, max_score: maxScore })
        .select("id, started_at")
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      setAttemptId(data.id);
      setStarted(true);
      setStartedAt(new Date(data.started_at));
      setAnswers({});
      setCurrentIndex(0);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const gradeAndSubmit = useCallback(async () => {
    if (!attemptId || !questions.length) return;
    setSubmitting(true);

    let score = 0;
    for (const q of questions) {
      const answer = answers[q.id];
      if (answer === undefined) continue;

      if (q.type === "mcq") {
        if (answer === (q.correct_answer as number)) score += q.points;
      } else if (q.type === "true_false") {
        if (answer === (q.correct_answer as boolean)) score += q.points;
      } else if (q.type === "fill_blank") {
        if (
          typeof answer === "string" &&
          answer.trim().toLowerCase() === (q.correct_answer as string).trim().toLowerCase()
        ) {
          score += q.points;
        }
      }
    }

    const { error } = await supabase
      .from("quiz_attempts")
      .update({
        answers: answers as any,
        score,
        completed_at: new Date().toISOString(),
      })
      .eq("id", attemptId);

    setSubmitting(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    queryClient.invalidateQueries({ queryKey: ["quiz-attempts"] });
    navigate(`/courses/${courseId}/quizzes/${quizId}/results/${attemptId}`);
  }, [attemptId, answers, questions, courseId, quizId, queryClient, navigate]);

  if (!quiz || !rawQuestions) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!started) {
    return (
      <div className="space-y-6 max-w-2xl mx-auto">
        <Link to={`/courses/${courseId}`} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to course
        </Link>
        <Card>
          <CardHeader>
            <CardTitle>{quiz.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {quiz.description && <p className="text-muted-foreground">{quiz.description}</p>}
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">{questions.length} question{questions.length !== 1 ? "s" : ""}</Badge>
              {quiz.time_limit && <Badge variant="outline"><Clock className="mr-1 h-3 w-3" />{quiz.time_limit} min</Badge>}
              <Badge variant="outline">{quiz.attempt_limit} attempt{quiz.attempt_limit !== 1 ? "s" : ""}</Badge>
              {quiz.randomize && <Badge variant="secondary">Randomized</Badge>}
            </div>
            {completedAttempts.length > 0 && (
              <div className="text-sm text-muted-foreground">
                Attempts used: {completedAttempts.length}/{quiz.attempt_limit}
                {completedAttempts[0]?.score !== null && (
                  <span className="ml-2">| Best score: {Math.max(...completedAttempts.map((a) => Number(a.score ?? 0)))}/{completedAttempts[0].max_score}</span>
                )}
              </div>
            )}
            {canAttempt ? (
              <Button onClick={() => startAttemptMutation.mutate()} disabled={startAttemptMutation.isPending} className="w-full">
                {startAttemptMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {completedAttempts.length > 0 ? "Retake Quiz" : "Start Quiz"}
              </Button>
            ) : (
              <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                <AlertTriangle className="h-4 w-4" />
                You have used all {quiz.attempt_limit} attempt{quiz.attempt_limit !== 1 ? "s" : ""}.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const answeredCount = Object.keys(answers).length;
  const progress = questions.length > 0 ? Math.round((answeredCount / questions.length) * 100) : 0;

  return (
    <div className="space-y-4 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">{quiz.title}</h2>
        {quiz.time_limit && startedAt && (
          <QuizTimer
            startedAt={startedAt}
            timeLimitMinutes={quiz.time_limit}
            onExpire={gradeAndSubmit}
          />
        )}
      </div>

      <div className="flex items-center gap-3">
        <Progress value={progress} className="flex-1 h-2" />
        <span className="text-sm text-muted-foreground whitespace-nowrap">{answeredCount}/{questions.length}</span>
      </div>

      {/* Question Navigation */}
      <div className="flex flex-wrap gap-1.5">
        {questions.map((q, i) => (
          <button
            key={q.id}
            onClick={() => setCurrentIndex(i)}
            className={`h-8 w-8 rounded text-xs font-medium transition-colors ${
              i === currentIndex
                ? "bg-primary text-primary-foreground"
                : answers[q.id] !== undefined
                ? "bg-primary/20 text-primary"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {i + 1}
          </button>
        ))}
      </div>

      {/* Question Card */}
      {currentQuestion && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="text-xs">
                Q{currentIndex + 1} of {questions.length}
              </Badge>
              <Badge variant="secondary" className="text-xs">{currentQuestion.points} pt{currentQuestion.points !== 1 ? "s" : ""}</Badge>
            </div>
            <CardTitle className="text-lg mt-2">{currentQuestion.question_text}</CardTitle>
          </CardHeader>
          <CardContent>
            {currentQuestion.type === "mcq" && currentQuestion.options && (
              <div className="space-y-2">
                {(currentQuestion.options as string[]).map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => setAnswers({ ...answers, [currentQuestion.id]: i })}
                    className={`w-full text-left rounded-lg border p-3 text-sm transition-colors ${
                      answers[currentQuestion.id] === i
                        ? "border-primary bg-primary/10 font-medium"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <span className="mr-2 font-medium">{String.fromCharCode(65 + i)}.</span>
                    {opt}
                  </button>
                ))}
              </div>
            )}

            {currentQuestion.type === "true_false" && (
              <div className="flex gap-3">
                {[true, false].map((val) => (
                  <button
                    key={String(val)}
                    onClick={() => setAnswers({ ...answers, [currentQuestion.id]: val })}
                    className={`flex-1 rounded-lg border p-4 text-center font-medium transition-colors ${
                      answers[currentQuestion.id] === val
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    {val ? "True" : "False"}
                  </button>
                ))}
              </div>
            )}

            {currentQuestion.type === "fill_blank" && (
              <Input
                placeholder="Type your answer..."
                value={(answers[currentQuestion.id] as string) ?? ""}
                onChange={(e) => setAnswers({ ...answers, [currentQuestion.id]: e.target.value })}
                className="max-w-md"
              />
            )}
          </CardContent>
        </Card>
      )}

      {/* Navigation & Submit */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
          disabled={currentIndex === 0}
        >
          <ArrowLeft className="mr-1 h-4 w-4" /> Previous
        </Button>

        {currentIndex < questions.length - 1 ? (
          <Button onClick={() => setCurrentIndex(currentIndex + 1)}>
            Next <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        ) : (
          <Button
            onClick={() => {
              const unanswered = questions.length - answeredCount;
              if (unanswered > 0) {
                if (!confirm(`You have ${unanswered} unanswered question${unanswered > 1 ? "s" : ""}. Submit anyway?`)) return;
              }
              gradeAndSubmit();
            }}
            disabled={submitting}
            className="bg-green-600 hover:bg-green-700"
          >
            {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
            Submit Quiz
          </Button>
        )}
      </div>
    </div>
  );
}

function QuizTimer({
  startedAt,
  timeLimitMinutes,
  onExpire,
}: {
  startedAt: Date;
  timeLimitMinutes: number;
  onExpire: () => void;
}) {
  const [remaining, setRemaining] = useState(() => {
    const elapsed = (Date.now() - startedAt.getTime()) / 1000;
    return Math.max(0, timeLimitMinutes * 60 - elapsed);
  });

  useEffect(() => {
    const interval = setInterval(() => {
      const elapsed = (Date.now() - startedAt.getTime()) / 1000;
      const left = Math.max(0, timeLimitMinutes * 60 - elapsed);
      setRemaining(left);
      if (left <= 0) {
        clearInterval(interval);
        onExpire();
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [startedAt, timeLimitMinutes, onExpire]);

  const mins = Math.floor(remaining / 60);
  const secs = Math.floor(remaining % 60);
  const isLow = remaining < 60;

  return (
    <Badge variant={isLow ? "destructive" : "outline"} className="text-sm font-mono gap-1">
      <Clock className="h-3.5 w-3.5" />
      {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
    </Badge>
  );
}

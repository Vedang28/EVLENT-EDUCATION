import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useQuizQuestions } from "@/hooks/useQuizQuestions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Trash2, Loader2, GripVertical, HelpCircle } from "lucide-react";
import { quizQuestionSchema } from "@/lib/validations";
import type { Database } from "@/integrations/supabase/types";

type QuizRow = Database["public"]["Tables"]["quizzes"]["Row"];
type QuestionRow = Database["public"]["Tables"]["quiz_questions"]["Row"];

type QuestionType = "mcq" | "true_false" | "fill_blank";

const TYPE_LABELS: Record<QuestionType, string> = {
  mcq: "Multiple Choice",
  true_false: "True / False",
  fill_blank: "Fill in the Blank",
};

interface QuizBuilderProps {
  quiz: QuizRow;
  courseId: string;
}

export default function QuizBuilder({ quiz, courseId }: QuizBuilderProps) {
  const queryClient = useQueryClient();
  const { data: questions } = useQuizQuestions(quiz.id);
  const [addingQuestion, setAddingQuestion] = useState(false);

  const deleteQuestionMutation = useMutation({
    mutationFn: async (questionId: string) => {
      const { error } = await supabase.from("quiz_questions").delete().eq("id", questionId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quiz-questions", quiz.id] });
      toast.success("Question deleted");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-lg">{quiz.title}</h3>
          {quiz.description && <p className="text-sm text-muted-foreground">{quiz.description}</p>}
          <div className="flex flex-wrap gap-2 mt-2">
            {quiz.time_limit && <Badge variant="outline">{quiz.time_limit} min</Badge>}
            <Badge variant="outline">{quiz.attempt_limit} attempt{quiz.attempt_limit !== 1 ? "s" : ""}</Badge>
            {quiz.randomize && <Badge variant="secondary">Randomized</Badge>}
            {quiz.show_answers && <Badge variant="secondary">Show Answers</Badge>}
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={() => setAddingQuestion(true)}>
          <Plus className="mr-1 h-4 w-4" /> Add Question
        </Button>
      </div>

      {questions && questions.length > 0 ? (
        <div className="space-y-3">
          {questions.map((q, i) => (
            <QuestionCard
              key={q.id}
              question={q}
              index={i}
              onDelete={() => {
                if (confirm("Delete this question?")) deleteQuestionMutation.mutate(q.id);
              }}
            />
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground text-center py-6">No questions yet. Add one to get started.</p>
      )}

      {addingQuestion && (
        <AddQuestionForm
          quizId={quiz.id}
          position={questions?.length ?? 0}
          onClose={() => setAddingQuestion(false)}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ["quiz-questions", quiz.id] });
            setAddingQuestion(false);
          }}
        />
      )}
    </div>
  );
}

function QuestionCard({ question, index, onDelete }: { question: QuestionRow; index: number; onDelete: () => void }) {
  const type = question.type as QuestionType;
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <span className="text-sm font-medium text-muted-foreground mt-0.5">Q{index + 1}</span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className="text-xs">{TYPE_LABELS[type]}</Badge>
              <Badge variant="secondary" className="text-xs">{question.points} pt{question.points !== 1 ? "s" : ""}</Badge>
            </div>
            <p className="text-sm font-medium">{question.question_text}</p>
            {type === "mcq" && question.options && (
              <div className="mt-2 space-y-1">
                {(question.options as string[]).map((opt, i) => (
                  <div key={i} className={`text-xs px-2 py-1 rounded ${i === (question.correct_answer as number) ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 font-medium" : "text-muted-foreground"}`}>
                    {String.fromCharCode(65 + i)}. {opt}
                  </div>
                ))}
              </div>
            )}
            {type === "true_false" && (
              <p className="text-xs mt-1 text-muted-foreground">
                Answer: <span className="font-medium">{(question.correct_answer as boolean) ? "True" : "False"}</span>
              </p>
            )}
            {type === "fill_blank" && (
              <p className="text-xs mt-1 text-muted-foreground">
                Answer: <span className="font-medium">{question.correct_answer as string}</span>
              </p>
            )}
          </div>
          <Button variant="ghost" size="sm" onClick={onDelete}>
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function AddQuestionForm({
  quizId,
  position,
  onClose,
  onSuccess,
}: {
  quizId: string;
  position: number;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [type, setType] = useState<QuestionType>("mcq");
  const [questionText, setQuestionText] = useState("");
  const [points, setPoints] = useState("1");
  const [options, setOptions] = useState(["", ""]);
  const [correctIndex, setCorrectIndex] = useState(0);
  const [trueFalseAnswer, setTrueFalseAnswer] = useState(true);
  const [fillAnswer, setFillAnswer] = useState("");

  const mutation = useMutation({
    mutationFn: async () => {
      let correctAnswer: number | boolean | string;
      let optionsVal: string[] | null = null;

      if (type === "mcq") {
        const filtered = options.filter((o) => o.trim());
        if (filtered.length < 2) throw new Error("At least 2 options required");
        if (correctIndex >= filtered.length) throw new Error("Select a valid correct answer");
        optionsVal = filtered;
        correctAnswer = correctIndex;
      } else if (type === "true_false") {
        correctAnswer = trueFalseAnswer;
      } else {
        if (!fillAnswer.trim()) throw new Error("Answer is required");
        correctAnswer = fillAnswer.trim();
      }

      const result = quizQuestionSchema.safeParse({
        type,
        question_text: questionText,
        options: optionsVal,
        correct_answer: correctAnswer,
        points: parseInt(points) || 1,
      });
      if (!result.success) throw new Error(result.error.errors[0].message);

      const { error } = await supabase.from("quiz_questions").insert({
        quiz_id: quizId,
        type: result.data.type,
        question_text: result.data.question_text,
        options: result.data.options as any,
        correct_answer: result.data.correct_answer as any,
        points: result.data.points ?? 1,
        position,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Question added!");
      onSuccess();
    },
    onError: (err: Error) => toast.error(err.message),
  });

  return (
    <Card className="border-primary/30">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <HelpCircle className="h-4 w-4" /> New Question
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Question Type</Label>
            <Select value={type} onValueChange={(v) => setType(v as QuestionType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mcq">Multiple Choice</SelectItem>
                <SelectItem value="true_false">True / False</SelectItem>
                <SelectItem value="fill_blank">Fill in the Blank</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Points</Label>
            <Input type="number" min={1} max={100} value={points} onChange={(e) => setPoints(e.target.value)} />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Question</Label>
          <Textarea
            placeholder="Enter your question..."
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            rows={2}
          />
        </div>

        {type === "mcq" && (
          <div className="space-y-2">
            <Label>Options (select the correct one)</Label>
            {options.map((opt, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  type="radio"
                  name="correct"
                  checked={correctIndex === i}
                  onChange={() => setCorrectIndex(i)}
                  className="accent-primary"
                />
                <Input
                  placeholder={`Option ${String.fromCharCode(65 + i)}`}
                  value={opt}
                  onChange={(e) => {
                    const copy = [...options];
                    copy[i] = e.target.value;
                    setOptions(copy);
                  }}
                  className="flex-1"
                />
                {options.length > 2 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const copy = options.filter((_, idx) => idx !== i);
                      setOptions(copy);
                      if (correctIndex >= copy.length) setCorrectIndex(copy.length - 1);
                    }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                )}
              </div>
            ))}
            {options.length < 6 && (
              <Button variant="ghost" size="sm" onClick={() => setOptions([...options, ""])}>
                <Plus className="mr-1 h-3 w-3" /> Add Option
              </Button>
            )}
          </div>
        )}

        {type === "true_false" && (
          <div className="space-y-2">
            <Label>Correct Answer</Label>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" checked={trueFalseAnswer} onChange={() => setTrueFalseAnswer(true)} className="accent-primary" />
                <span className="text-sm">True</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" checked={!trueFalseAnswer} onChange={() => setTrueFalseAnswer(false)} className="accent-primary" />
                <span className="text-sm">False</span>
              </label>
            </div>
          </div>
        )}

        {type === "fill_blank" && (
          <div className="space-y-2">
            <Label>Correct Answer (case-insensitive match)</Label>
            <Input placeholder="Expected answer" value={fillAnswer} onChange={(e) => setFillAnswer(e.target.value)} />
          </div>
        )}

        <div className="flex gap-2">
          <Button onClick={() => mutation.mutate()} disabled={!questionText.trim() || mutation.isPending}>
            {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Add Question
          </Button>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
        </div>
      </CardContent>
    </Card>
  );
}

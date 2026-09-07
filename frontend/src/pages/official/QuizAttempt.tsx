import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { quizAPI } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import type { QuizDetail, QuizResult } from '../../types';
import { ArrowLeft, CheckCircle2, XCircle, ChevronRight, Trophy, RotateCcw } from 'lucide-react';

export default function QuizAttempt() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState<QuizDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [result, setResult] = useState<QuizResult | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (id) {
      quizAPI.get(parseInt(id)).then((q) => { setQuiz(q); setLoading(false); }).catch(() => setLoading(false));
    }
  }, [id]);

  const handleSelect = (option: string) => {
    if (result) return;
    setAnswers({ ...answers, [quiz!.questions[currentQ].id]: option });
  };

  const handleSubmit = async () => {
    if (!quiz) return;
    setSubmitting(true);
    const answerList = quiz.questions.map((q) => ({
      question_id: q.id,
      selected_option: answers[q.id] || '',
    }));
    try {
      const res = await quizAPI.submit(quiz.id, answerList);
      setResult(res);
    } catch {
      alert('Failed to submit quiz');
    }
    setSubmitting(false);
  };

  if (loading) return <LoadingSpinner message="Loading quiz..." />;
  if (!quiz) return <p className="text-center py-10 text-slate-400">Quiz not found.</p>;

  const questions = quiz.questions;
  const question = questions[currentQ];
  const allAnswered = questions.every((q) => answers[q.id]);
  const progress = ((currentQ + 1) / questions.length) * 100;

  // Result view
  if (result) {
    return (
      <div className="max-w-3xl mx-auto space-y-6 animate-fadeIn">
        <div className="bg-gradient-to-r from-indigo-600 to-violet-600 rounded-2xl p-8 text-white text-center shadow-lg">
          <Trophy className="w-12 h-12 mx-auto mb-3 text-amber-300" />
          <h1 className="text-2xl font-bold">Quiz Complete!</h1>
          <p className="text-indigo-100 mt-1">{result.quiz_title}</p>
          <div className="mt-4 text-5xl font-black">{result.percentage}%</div>
          <p className="text-indigo-200 mt-1">{result.score} / {result.total} correct</p>
        </div>

        <div className="space-y-3">
          {result.results.map((r, i) => (
            <div key={r.question_id} className={`bg-white rounded-xl border p-4 ${r.is_correct ? 'border-emerald-200' : 'border-rose-200'}`}>
              <div className="flex items-start gap-3">
                {r.is_correct ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-800">Q{i + 1}. {r.question_text}</p>
                  <div className="mt-2 text-xs space-y-1">
                    <p>Your answer: <span className={`font-semibold ${r.is_correct ? 'text-emerald-600' : 'text-rose-600'}`}>{r.selected_option || 'Not answered'}</span></p>
                    {!r.is_correct && <p>Correct answer: <span className="font-semibold text-emerald-600">{r.correct_option}</span></p>}
                  </div>
                  {r.explanation && (
                    <p className="text-xs text-slate-500 mt-2 bg-slate-50 rounded-lg p-2">💡 {r.explanation}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          <button onClick={() => navigate('/quiz')} className="flex-1 bg-white border border-slate-200 text-slate-700 font-medium py-2.5 rounded-xl flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Quizzes
          </button>
          <button onClick={() => navigate('/results')} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 rounded-xl flex items-center justify-center gap-2 transition-colors">
            View All Results <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // Quiz view
  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button onClick={() => navigate('/quiz')} className="text-sm text-slate-500 hover:text-slate-700 flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <span className="text-sm font-medium text-slate-600">{quiz.title}</span>
      </div>

      {/* Progress */}
      <div>
        <div className="flex justify-between text-xs text-slate-400 mb-1">
          <span>Question {currentQ + 1} of {questions.length}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
          <div className="h-2 bg-indigo-500 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Question */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <p className="text-base font-semibold text-slate-800 mb-5">{question.question_text}</p>

        <div className="space-y-3">
          {(['A', 'B', 'C', 'D'] as const).map((opt) => {
            const text = opt === 'A' ? question.option_a : opt === 'B' ? question.option_b : opt === 'C' ? question.option_c : question.option_d;
            const selected = answers[question.id] === opt;
            return (
              <button
                key={opt}
                onClick={() => handleSelect(opt)}
                className={`w-full text-left p-4 rounded-xl border-2 text-sm transition-all ${
                  selected
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-800 font-medium'
                    : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold mr-3 ${
                  selected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'
                }`}>
                  {opt}
                </span>
                {text}
              </button>
            );
          })}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex gap-3">
        <button
          onClick={() => setCurrentQ(Math.max(0, currentQ - 1))}
          disabled={currentQ === 0}
          className="px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-colors"
        >
          Previous
        </button>

        {currentQ < questions.length - 1 ? (
          <button
            onClick={() => setCurrentQ(currentQ + 1)}
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 rounded-xl flex items-center justify-center gap-2 transition-colors"
          >
            Next <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={!allAnswered || submitting}
            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2.5 rounded-xl flex items-center justify-center gap-2 disabled:opacity-60 transition-colors"
          >
            {submitting ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>Submit Quiz <CheckCircle2 className="w-4 h-4" /></>
            )}
          </button>
        )}
      </div>
    </div>
  );
}

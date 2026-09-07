import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { quizAPI } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import type { Quiz } from '../../types';
import { ClipboardCheck, ArrowRight, Clock } from 'lucide-react';

export default function QuizList() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    quizAPI.list().then((q) => { setQuizzes(q); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner message="Loading quizzes..." />;

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-xl font-bold text-slate-800">Available Quizzes</h1>
        <p className="text-sm text-slate-500 mt-0.5">Test your knowledge and track your improvement</p>
      </div>

      {quizzes.length === 0 ? (
        <p className="text-center text-sm text-slate-400 py-10">No quizzes available yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {quizzes.map((q) => (
            <Link
              key={q.id}
              to={`/quiz/${q.id}`}
              className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-lg hover:border-indigo-200 transition-all group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                  <ClipboardCheck className="w-5 h-5 text-indigo-600" />
                </div>
                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />
              </div>
              <h3 className="text-sm font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors">
                {q.title}
              </h3>
              <p className="text-xs text-slate-500 mt-1 line-clamp-2">{q.description}</p>
              <div className="flex items-center gap-3 mt-4 pt-3 border-t border-slate-100 text-xs text-slate-400">
                <span className="bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded font-medium">
                  {q.competency_area}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {q.total_questions} questions
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

import { useEffect, useState, useRef } from 'react';
import { materialAPI, quizAPI } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import type { LearningMaterial } from '../../types';
import { Upload, FileText, FileSpreadsheet, CheckCircle2, AlertCircle, Loader2, Sparkles } from 'lucide-react';

export default function LearningMaterials() {
  const [materials, setMaterials] = useState<LearningMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [generating, setGenerating] = useState<number | null>(null);
  const [msg, setMsg] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    materialAPI.list().then((m) => { setMaterials(m); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setMsg('');
    try {
      const uploaded = await materialAPI.upload(file);
      setMaterials((prev) => [uploaded, ...prev]);
      setMsg(`✅ "${uploaded.original_name}" uploaded and processed successfully!`);
    } catch (err: any) {
      setMsg(`❌ Upload failed: ${err.response?.data?.detail || 'Unknown error'}`);
    }
    setUploading(false);
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleGenerate = async (materialId: number) => {
    setGenerating(materialId);
    try {
      const quiz = await quizAPI.generate({ material_id: materialId, num_questions: 5 });
      setMsg(`✅ Quiz "${quiz.title}" generated with ${quiz.total_questions} questions!`);
    } catch (err: any) {
      setMsg(`❌ Quiz generation failed: ${err.response?.data?.detail || 'Unknown error'}`);
    }
    setGenerating(null);
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
  };

  if (loading) return <LoadingSpinner message="Loading materials..." />;

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-xl font-bold text-slate-800">Learning Materials</h1>
        <p className="text-sm text-slate-500 mt-0.5">Upload PDF or PPTX files and generate quizzes with AI</p>
      </div>

      {msg && (
        <div className={`text-sm px-4 py-3 rounded-lg ${msg.includes('✅') ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
          {msg}
        </div>
      )}

      {/* Upload Zone */}
      <div
        onClick={() => fileRef.current?.click()}
        className="bg-white border-2 border-dashed border-slate-300 hover:border-indigo-400 rounded-xl p-10 text-center cursor-pointer transition-colors group"
      >
        <input ref={fileRef} type="file" accept=".pdf,.pptx,.ppt" onChange={handleUpload} className="hidden" />
        {uploading ? (
          <div className="flex flex-col items-center">
            <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mb-3" />
            <p className="text-sm text-slate-600">Uploading and extracting text...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <Upload className="w-10 h-10 text-slate-400 group-hover:text-indigo-500 mb-3 transition-colors" />
            <p className="text-sm font-medium text-slate-700">Click to upload PDF or PPTX</p>
            <p className="text-xs text-slate-400 mt-1">Text will be extracted automatically for quiz generation</p>
          </div>
        )}
      </div>

      {/* Materials List */}
      {materials.length === 0 ? (
        <p className="text-center text-sm text-slate-400 py-8">No materials uploaded yet. Upload your first file above.</p>
      ) : (
        <div className="space-y-3">
          {materials.map((m) => (
            <div key={m.id} className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-4 hover:shadow-md transition-shadow">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                m.file_type === 'pdf' ? 'bg-rose-100' : 'bg-amber-100'
              }`}>
                {m.file_type === 'pdf' ? (
                  <FileText className="w-5 h-5 text-rose-600" />
                ) : (
                  <FileSpreadsheet className="w-5 h-5 text-amber-600" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-800 truncate">{m.original_name}</p>
                <div className="flex items-center gap-3 mt-0.5 text-xs text-slate-400">
                  <span>{m.file_type.toUpperCase()}</span>
                  <span>{formatSize(m.file_size)}</span>
                  <span>{new Date(m.uploaded_at).toLocaleDateString()}</span>
                </div>
                {m.extracted_text_preview && (
                  <p className="text-xs text-slate-400 mt-1 line-clamp-1">{m.extracted_text_preview}</p>
                )}
              </div>

              <div className="flex items-center gap-3 flex-shrink-0">
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                  m.status === 'processed' ? 'bg-emerald-100 text-emerald-700' :
                  m.status === 'failed' ? 'bg-rose-100 text-rose-700' :
                  'bg-amber-100 text-amber-700'
                }`}>
                  {m.status === 'processed' ? <CheckCircle2 className="w-3 h-3 inline mr-1" /> :
                   m.status === 'failed' ? <AlertCircle className="w-3 h-3 inline mr-1" /> : null}
                  {m.status}
                </span>

                {m.status === 'processed' && (
                  <button
                    onClick={() => handleGenerate(m.id)}
                    disabled={generating === m.id}
                    className="text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg flex items-center gap-1.5 disabled:opacity-60 transition-colors"
                  >
                    {generating === m.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Sparkles className="w-3.5 h-3.5" />
                    )}
                    Generate Quiz
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

import { Loader2 } from 'lucide-react';

interface Props {
  message?: string;
}

export default function LoadingSpinner({ message = 'Loading...' }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-20 animate-fadeIn">
      <Loader2 className="w-10 h-10 animate-spin text-indigo-500 mb-3" />
      <p className="text-sm text-slate-500">{message}</p>
    </div>
  );
}

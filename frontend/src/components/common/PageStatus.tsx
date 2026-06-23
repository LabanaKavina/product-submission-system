import Spinner from '../ui/Spinner';

interface LoadingStateProps {
  fullScreen?: boolean;
}

export function LoadingState({ fullScreen = false }: LoadingStateProps) {
  const wrapper = fullScreen
    ? 'flex items-center justify-center min-h-screen'
    : 'flex items-center justify-center py-24';
  return (
    <div className={wrapper}>
      <Spinner size="lg" />
    </div>
  );
}

interface ErrorStateProps {
  message: string;
  fullScreen?: boolean;
}

export function ErrorState({ message, fullScreen = false }: ErrorStateProps) {
  const wrapper = fullScreen
    ? 'flex items-center justify-center min-h-screen'
    : 'flex items-center justify-center py-24';
  return (
    <div className={wrapper}>
      <p className="text-red-600" role="alert">
        {message}
      </p>
    </div>
  );
}

interface EmptyStateProps {
  message: string;
  action?: React.ReactNode;
}

export function EmptyState({ message, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <p className="text-gray-500 text-lg mb-4">{message}</p>
      {action}
    </div>
  );
}

export function InlineError({ message }: { message: string }) {
  return (
    <div
      role="alert"
      className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700"
    >
      {message}
    </div>
  );
}

export function InlineSuccess({ message }: { message: string }) {
  return (
    <div className="rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-3 text-emerald-800 text-sm">
      {message}
    </div>
  );
}

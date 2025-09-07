interface AuthErrorProps {
  message: string;
}

export default function AuthError({ message }: AuthErrorProps) {
  if (!message) return null;
  
  return (
    <div className="text-red-500 dark:text-red-400 text-sm text-center bg-red-50 dark:bg-red-900/10 p-3 rounded-lg">
      {message}
    </div>
  );
}

interface AuthHeaderProps {
  title: string;
  subtitle: string;
}

export default function AuthHeader({ title, subtitle }: AuthHeaderProps) {
  return (
    <div className="space-y-6 text-center">
      <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
        {title}
      </h2>
      <p className="text-gray-600 dark:text-gray-400">
        {subtitle}
      </p>
    </div>
  );
}

import Link from 'next/link';

export default function AppLogo() {
  return (
    <Link
      href="/home"
      className="text-xl font-bold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
    >
      Task Flow
    </Link>
  );
}

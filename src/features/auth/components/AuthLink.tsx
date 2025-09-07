import Link from 'next/link';

interface AuthLinkProps {
  href: string;
  children: React.ReactNode;
}

export default function AuthLink({ href, children }: AuthLinkProps) {
  return (
    <Link
      href={href}
      className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300
                 transition-colors duration-200"
    >
      {children}
    </Link>
  );
}

'use client';

// PLACEHOLDER: This is a simple home page component.
export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Welcome to Task Flow
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
          Manage your projects and tasks efficiently
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {/* This is where boards will be displayed */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Your Boards
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Create and manage your project boards here.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Recent Activity
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              View your recent tasks and updates.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Quick Actions
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Create new boards and tasks quickly.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

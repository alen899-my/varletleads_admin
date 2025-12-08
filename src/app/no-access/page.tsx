export default function NoAccess() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="p-6 bg-white dark:bg-gray-800 border rounded-xl shadow-lg text-center">
        <h1 className="text-xl font-semibold text-red-600 mb-2">Access Denied</h1>
        <p className="text-gray-600 dark:text-gray-300">
          You don’t have permission to view this page.
        </p>
      </div>
    </div>
  );
}

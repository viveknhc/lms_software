export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span className="font-semibold text-gray-700">LMS</span>
            <span>Learning Management System</span>
          </div>
          <p className="text-xs text-gray-400">
            &copy; {new Date().getFullYear()} LMS. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

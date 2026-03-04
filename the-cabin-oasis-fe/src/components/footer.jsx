export default function Footer() {
  return (
    <footer className="bg-pine_teal-500/95 backdrop-blur-md w-full mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center py-6 sm:py-8">
          <p className="m-0 text-dry_sage-50 text-sm sm:text-base">
            &copy; {new Date().getFullYear()} The Cabin Oasis. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

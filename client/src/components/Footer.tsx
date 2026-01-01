const Footer = () => {
  return (
    <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-4 px-6 mt-auto transition-colors duration-200">
      <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-500 dark:text-gray-400">
        <div>
          &copy; {new Date().getFullYear()} Fashion Tailors Management System. All rights reserved.
        </div>
        <div className="mt-2 md:mt-0">
          Designed & Developed by <a href="https://www.linkedin.com/in/arshed-huzair/" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Arshed Ahmed</a> for FTMS
        </div>
      </div>
    </footer>
  );
};

export default Footer;

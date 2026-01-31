
import React from 'react';

interface Props {
  onMenuClick: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

const Navbar: React.FC<Props> = ({ onMenuClick, theme, onToggleTheme }) => {
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);

  return (
    <nav className="h-18 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30 transition-colors">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
        >
          <i className="fas fa-bars text-xl"></i>
        </button>
        <h1 className="text-xl font-black">
          <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-600 bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">Gen</span>
          <span className="text-orange-500"><i className="fas fa-search"></i></span>
          <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-600 bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient"> AI</span>
        </h1>
      </div>

      <div className="flex items-center gap-4 sm:gap-6">
        <button
          onClick={onToggleTheme}
          className="p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:scale-110 transition-all border border-transparent hover:border-indigo-200 dark:hover:border-indigo-800"
        >
          {theme === 'light' ? <i className="fas fa-moon"></i> : <i className="fas fa-sun"></i>}
        </button>

        <div className="relative">
          <div
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-3 cursor-pointer group p-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
          >
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-slate-700 dark:text-slate-200 leading-tight">Dr. Researcher</p>
              <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-tighter">Verified Academic</p>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 border-2 border-white dark:border-slate-700 shadow-lg shadow-indigo-100 dark:shadow-none flex items-center justify-center overflow-hidden transition-all group-hover:rotate-6 group-hover:scale-110">
              <img src="https://picsum.photos/seed/researcher/100" alt="Profile" className="object-cover w-full h-full" />
            </div>
          </div>

          {isDropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden animate-fadeIn">
              <button
                onClick={() => {
                  // Logout logic here
                  window.location.href = 'login.html';
                }}
                className="w-full text-left px-4 py-3 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center gap-2"
              >
                <i className="fas fa-sign-out-alt"></i> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

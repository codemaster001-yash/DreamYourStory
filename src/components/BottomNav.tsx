import React from 'react';
import { NavLink } from 'react-router-dom';
import { HomeIcon, BookOpenIcon, UsersIcon } from './icons/Icons';

const BottomNav: React.FC = () => {
  const commonClasses = "flex flex-col items-center justify-center p-2 rounded-lg transition-colors duration-200 w-20";
  const activeClass = "text-orange-500 bg-orange-100";
  const inactiveClass = "text-gray-400 hover:text-orange-500";

  return (
    <nav className="w-full max-w-md bg-white/80 backdrop-blur-sm shadow-t-lg border-t border-gray-200 sticky bottom-0">
      <div className="flex justify-around items-center h-20 px-4">
        <NavLink to="/" className={({ isActive }) => `${commonClasses} ${isActive ? activeClass : inactiveClass}`}>
          <HomeIcon />
          <span className="text-xs mt-1 font-bold">Home</span>
        </NavLink>
        <NavLink to="/history" className={({ isActive }) => `${commonClasses} ${isActive ? activeClass : inactiveClass}`}>
          <BookOpenIcon />
          <span className="text-xs mt-1 font-bold">My Stories</span>
        </NavLink>
        <NavLink to="/characters" className={({ isActive }) => `${commonClasses} ${isActive ? activeClass : inactiveClass}`}>
          <UsersIcon />
          <span className="text-xs mt-1 font-bold">Characters</span>
        </NavLink>
      </div>
    </nav>
  );
};

export default BottomNav;

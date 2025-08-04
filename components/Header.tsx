
import React from 'react';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

const Header: React.FC<HeaderProps> = ({ title, subtitle }) => {
  return (
    <header className="p-6 text-center">
      <h1 className="text-4xl font-extrabold text-orange-600">{title}</h1>
      {subtitle && <p className="text-gray-500 mt-2">{subtitle}</p>}
    </header>
  );
};

export default Header;

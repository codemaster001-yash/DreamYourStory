
import React from 'react';
import { SparklesIcon } from './icons/Icons';

interface LoaderProps {
  text: string;
}

const Loader: React.FC<LoaderProps> = ({ text }) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 text-orange-500">
      <div className="relative">
        <SparklesIcon className="w-16 h-16 animate-pulse" />
      </div>
      <p className="mt-4 text-lg font-bold animate-pulse">{text}</p>
    </div>
  );
};

export default Loader;

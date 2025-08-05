import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Gender, StoryParams } from '../types';
import Header from '../components/Header';
import { SparklesIcon } from '../components/icons/Icons';

const HomeScreen: React.FC = () => {
  const [gender, setGender] = useState<Gender>(Gender.UNSPECIFIED);
  const [age, setAge] = useState<number>(5);
  const [theme, setTheme] = useState<string>('');
  const [language, setLanguage] = useState<string>('English');
  const navigate = useNavigate();

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (theme.trim() && language.trim()) {
      const params: StoryParams = { gender, age, theme, language };
      navigate('/story', { state: { params } });
    }
  };
  
  const themeSuggestions = ["A lost dinosaur", "A friendly pirate's treasure", "A magical treehouse", "The secret of the sleeping volcano", "A bunny who wanted to fly"];

  return (
    <div className="p-6 h-full flex flex-col">
      <Header title="Dream a Story" subtitle="Let's create a new adventure!" />
      
      <form onSubmit={handleGenerate} className="flex-grow flex flex-col space-y-6">
        <div>
          <label className="text-lg font-bold text-gray-700">Who is the story for?</label>
          <div className="mt-2 grid grid-cols-3 gap-3">
            {(Object.values(Gender)).map(g => (
              <button type="button" key={g} onClick={() => setGender(g)} className={`p-3 rounded-xl text-center font-bold capitalize transition-all duration-200 ${gender === g ? 'bg-orange-500 text-white shadow-lg scale-105' : 'bg-white text-gray-600 shadow-md'}`}>
                {g === Gender.UNSPECIFIED ? 'Anyone' : g}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="age" className="text-lg font-bold text-gray-700">How old are they?</label>
          <div className="mt-2 flex items-center space-x-4">
            <input
              type="range"
              id="age"
              min="2"
              max="12"
              value={age}
              onChange={(e) => setAge(parseInt(e.target.value))}
              className="w-full h-2 bg-white rounded-lg appearance-none cursor-pointer"
            />
            <span className="font-bold text-orange-600 bg-white px-3 py-1 rounded-full shadow-md">{age}</span>
          </div>
        </div>
        
        <div>
            <label htmlFor="language" className="text-lg font-bold text-gray-700">What language?</label>
             <input
                type="text"
                id="language"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                placeholder="e.g., English, Spanish..."
                className="mt-2 w-full p-4 rounded-xl border border-gray-300 shadow-md focus:ring-2 focus:ring-orange-400 focus:outline-none"
             />
        </div>

        <div>
          <label htmlFor="theme" className="text-lg font-bold text-gray-700">What's is the story about?</label>
          <input
            type="text"
            id="theme"
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            placeholder="e.g., A brave little knight"
            className="mt-2 w-full p-4 rounded-xl border border-gray-300 shadow-md focus:ring-2 focus:ring-orange-400 focus:outline-none"
          />
           <div className="mt-2 flex flex-wrap gap-2">
            {themeSuggestions.map(suggestion => (
              <button key={suggestion} type="button" onClick={() => setTheme(suggestion)} className="text-xs bg-orange-100 text-orange-700 px-3 py-1 rounded-full hover:bg-orange-200 transition">
                {suggestion}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-grow"></div>

        <button type="submit" disabled={!theme.trim() || !language.trim()} className="w-full flex items-center justify-center p-4 bg-orange-500 text-white font-bold text-xl rounded-2xl shadow-lg hover:bg-orange-600 disabled:bg-gray-300 disabled:shadow-none transition-all duration-300 transform hover:scale-105">
          <SparklesIcon className="w-6 h-6 mr-3" />
          Create My Story
        </button><br></br>
      </form>
    </div>
  );
};

export default HomeScreen;

import React, { useState, useContext, useEffect } from 'react';
import { ApiKeyContext } from '../contexts/ApiKeyContext';
import Header from '../components/Header';
import { SparklesIcon } from '../components/icons/Icons';

const SettingsScreen: React.FC = () => {
  const { apiKey, setApiKey } = useContext(ApiKeyContext);
  const [localKey, setLocalKey] = useState('');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved'>('idle');

  useEffect(() => {
    if (apiKey) {
      setLocalKey(apiKey);
    }
  }, [apiKey]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setApiKey(localKey);
    setSaveStatus('saved');
    setTimeout(() => setSaveStatus('idle'), 2000); // Reset status after 2 seconds
  };

  return (
    <div className="p-6 h-full flex flex-col">
      <Header title="Settings" subtitle="Configure your app" />

      <form onSubmit={handleSave} className="flex-grow flex flex-col space-y-6">
        <div>
          <label htmlFor="apiKey" className="text-lg font-bold text-gray-700">Gemini API Key</label>
          <p className="text-sm text-gray-500 mt-1 mb-2">
            Your key is saved only on this device and never sent to anyone except Google for API calls.
          </p>
          <input
            type="password"
            id="apiKey"
            value={localKey}
            onChange={(e) => setLocalKey(e.target.value)}
            placeholder="Enter your API key here"
            className="w-full p-4 rounded-xl border border-gray-300 shadow-md focus:ring-2 focus:ring-orange-400 focus:outline-none"
          />
        </div>
        
        <div className="flex-grow"></div>

        <button 
          type="submit" 
          disabled={!localKey.trim()}
          className="w-full flex items-center justify-center p-4 bg-orange-500 text-white font-bold text-xl rounded-2xl shadow-lg hover:bg-orange-600 disabled:bg-gray-300 disabled:shadow-none transition-all duration-300 transform hover:scale-105"
        >
          <SparklesIcon className="w-6 h-6 mr-3" />
          {saveStatus === 'saved' ? 'Saved!' : 'Save Key'}
        </button>
      </form>
    </div>
  );
};

export default SettingsScreen;

import React, { useState, useContext, useEffect } from 'react';
import { ApiKeyContext } from '../contexts/ApiKeyContext';
import { VoiceContext } from '../contexts/VoiceContext';
import { VoicePreference } from '../types';
import Header from '../components/Header';
import { SparklesIcon } from '../components/icons/Icons';

const SettingsScreen: React.FC = () => {
  const { apiKey, setApiKey } = useContext(ApiKeyContext);
  const { voicePreference, setVoicePreference } = useContext(VoiceContext);
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
    setTimeout(() => setSaveStatus('idle'), 2000);
  };

  return (
    <div className="p-6 h-full flex flex-col">
      <Header title="Settings" subtitle="Configure your app" />

      <form onSubmit={handleSave} className="space-y-8">
        <div>
          <label htmlFor="apiKey" className="text-lg font-bold text-gray-700">Gemini API Key</label>
          <p className="text-sm text-gray-500 mt-1 mb-2">
            Your key is saved only on this device and never sent to anyone except Google for API calls.
          </p>
          <input
            type="text"
            id="apiKey"
            value={localKey}
            onChange={(e) => setLocalKey(e.target.value)}
            placeholder="Enter your API key here"
            className="w-full p-4 rounded-xl border border-gray-300 shadow-md focus:ring-2 focus:ring-orange-400 focus:outline-none"
          />
          <p className="text-xs text-gray-500 mt-2">Preferred Gemini 2.5 Flash model and above</p>
        </div>
        
        <button 
          type="submit" 
          disabled={!localKey.trim()}
          className="w-full flex items-center justify-center p-3 bg-orange-500 text-white font-bold text-lg rounded-2xl shadow-lg hover:bg-orange-600 disabled:bg-gray-300 disabled:shadow-none transition-all duration-300 transform hover:scale-105"
        >
          <SparklesIcon className="w-6 h-6 mr-3" />
          {saveStatus === 'saved' ? 'Key Saved!' : 'Save API Key'}
        </button>

        <div>
            <label className="text-lg font-bold text-gray-700">Voice Preference</label>
            <p className="text-sm text-gray-500 mt-1 mb-2">
                Select a preferred voice type. The app will try to find the best match available on your device.
            </p>
            <div className="mt-2 grid grid-cols-3 sm:grid-cols-5 gap-3">
                {(['auto', 'male', 'female', 'boy', 'girl'] as VoicePreference[]).map(pref => (
                  <button 
                    type="button" 
                    key={pref} 
                    onClick={() => setVoicePreference(pref)} 
                    className={`p-3 rounded-xl text-center font-bold capitalize transition-all duration-200 ${voicePreference === pref ? 'bg-orange-500 text-white shadow-lg scale-105' : 'bg-white text-gray-600 shadow-md'}`}
                  >
                    {pref}
                  </button>
                ))}
            </div>
        </div>
      </form>
    </div>
  );
};

export default SettingsScreen;
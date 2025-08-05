import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { VoicePreference } from '../types';

interface VoiceContextType {
  voicePreference: VoicePreference;
  setVoicePreference: (pref: VoicePreference) => void;
}

export const VoiceContext = createContext<VoiceContextType>({
  voicePreference: 'auto',
  setVoicePreference: () => {},
});

interface VoiceProviderProps {
  children: ReactNode;
}

export const VoiceProvider: React.FC<VoiceProviderProps> = ({ children }) => {
  const [voicePreference, setVoicePreferenceState] = useState<VoicePreference>('auto');

  useEffect(() => {
    try {
      const storedPref = localStorage.getItem('voice-preference') as VoicePreference | null;
      if (storedPref && ['auto', 'male', 'female', 'boy', 'girl'].includes(storedPref)) {
        setVoicePreferenceState(storedPref);
      }
    } catch (error) {
      console.error('Could not read voice preference from local storage.', error);
    }
  }, []);

  const setVoicePreference = (pref: VoicePreference) => {
    try {
      localStorage.setItem('voice-preference', pref);
      setVoicePreferenceState(pref);
    } catch (error) {
      console.error('Could not save voice preference to local storage.', error);
    }
  };

  return (
    <VoiceContext.Provider value={{ voicePreference, setVoicePreference }}>
      {children}
    </VoiceContext.Provider>
  );
};

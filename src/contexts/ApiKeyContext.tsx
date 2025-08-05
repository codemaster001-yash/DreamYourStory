import React, { createContext, useState, useEffect, ReactNode } from 'react';

interface ApiKeyContextType {
  apiKey: string | null;
  setApiKey: (key: string | null) => void;
}

export const ApiKeyContext = createContext<ApiKeyContextType>({
  apiKey: null,
  setApiKey: () => {},
});

interface ApiKeyProviderProps {
  children: ReactNode;
}

export const ApiKeyProvider: React.FC<ApiKeyProviderProps> = ({ children }) => {
  const [apiKey, setApiKeyState] = useState<string | null>(null);

  useEffect(() => {
    try {
      const storedKey = localStorage.getItem('gemini-api-key');
      if (storedKey) {
        setApiKeyState(storedKey);
      }
    } catch (error) {
      console.error('Could not read API key from local storage.', error);
    }
  }, []);

  const setApiKey = (key: string | null) => {
    try {
      if (key) {
        localStorage.setItem('gemini-api-key', key);
      } else {
        localStorage.removeItem('gemini-api-key');
      }
      setApiKeyState(key);
    } catch (error) {
      console.error('Could not save API key to local storage.', error);
    }
  };

  return (
    <ApiKeyContext.Provider value={{ apiKey, setApiKey }}>
      {children}
    </ApiKeyContext.Provider>
  );
};
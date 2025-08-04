import { useState, useCallback, useEffect } from 'react';
import { Story } from '../types';

const DB_NAME = 'ai-storybook-db';
const DB_VERSION = 1;
const STORE_NAME = 'stories';

const getDb = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(new Error("Error opening DB"));
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
  });
};

export const useStoryHistory = () => {
  const [stories, setStories] = useState<Story[]>([]);

  useEffect(() => {
    const loadStories = async () => {
      try {
        const db = await getDb();
        const transaction = db.transaction(STORE_NAME, 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.getAll();

        request.onerror = () => {
          console.error("Failed to load stories from IndexedDB");
        };
        request.onsuccess = () => {
          setStories(request.result.sort((a: Story, b: Story) => b.createdAt - a.createdAt));
        };
      } catch (error) {
        console.error("Failed to open DB for loading stories", error);
      }
    };
    loadStories();
  }, []);

  const saveStory = useCallback(async (story: Story) => {
    try {
      const db = await getDb();
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(story);

      return new Promise<void>((resolve, reject) => {
        request.onsuccess = () => {
          setStories(prevStories => [story, ...prevStories.filter(s => s.id !== story.id)].sort((a,b) => b.createdAt - a.createdAt));
          resolve();
        };
        request.onerror = () => {
          console.error("Failed to save story to IndexedDB", request.error);
          reject(request.error);
        };
      });
    } catch (error) {
       console.error("Failed to open DB for saving story", error);
    }
  }, []);
  
  const deleteStory = useCallback(async (storyId: string) => {
    try {
      const db = await getDb();
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(storyId);

      return new Promise<void>((resolve, reject) => {
        request.onsuccess = () => {
          setStories(prevStories => prevStories.filter(s => s.id !== storyId));
          resolve();
        };
        request.onerror = () => {
          console.error("Failed to delete story from IndexedDB", request.error);
          reject(request.error);
        };
      });
    } catch (error) {
      console.error("Failed to open DB for deleting story", error);
    }
  }, []);

  const isStorySaved = useCallback((storyId: string): boolean => {
      return stories.some(s => s.id === storyId);
  }, [stories]);

  return { stories, saveStory, deleteStory, isStorySaved };
};

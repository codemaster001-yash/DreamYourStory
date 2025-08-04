
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { generateStoryContent, generateImage, generateCharacterImage } from '../services/geminiService';
import { Story, StoryParams } from '../types';
import Loader from '../components/Loader';
import SceneCard from '../components/SceneCard';
import { useTextToSpeech } from '../hooks/useTextToSpeech';
import { useStoryHistory } from '../hooks/useStoryHistory';
import { PlayIcon, PauseIcon, HeartIcon, ChevronLeftIcon, ChevronRightIcon } from '../components/icons/Icons';

type LoadingState = 'idle' | 'generating_text' | 'generating_images' | 'generating_characters' | 'error' | 'done';

const StoryScreen: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { saveStory, isStorySaved } = useStoryHistory();

  const [story, setStory] = useState<Story | null>(location.state?.story || null);
  const [loadingState, setLoadingState] = useState<LoadingState>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (story) {
        setIsSaved(isStorySaved(story.id));
    }
  }, [story, isStorySaved]);

  const scenes = useMemo(() => story?.scenes || [], [story]);
  const activeScene = scenes[currentSceneIndex];

  const handleSwipe = useCallback((direction: 'next' | 'previous') => {
    stop();
    if (direction === 'next' && currentSceneIndex < scenes.length - 1) {
      setCurrentSceneIndex(prev => prev + 1);
    } else if (direction === 'previous' && currentSceneIndex > 0) {
      setCurrentSceneIndex(prev => prev - 1);
    }
  }, [currentSceneIndex, scenes.length]);


  const handleSpeechEnd = useCallback(() => {
    if (isPlaying && currentSceneIndex < scenes.length - 1) {
      setTimeout(() => handleSwipe('next'), 500);
    } else {
        setIsPlaying(false);
    }
  }, [isPlaying, currentSceneIndex, scenes.length, handleSwipe]);

  const { speak, stop, isSpeaking } = useTextToSpeech(handleSpeechEnd);

  useEffect(() => {
    if (isSpeaking && isPlaying && activeScene && story) {
      speak(activeScene.text, story.params.language);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeScene, isPlaying]);


  useEffect(() => {
    const generateNewStory = async (params: StoryParams) => {
      try {
        setLoadingState('generating_text');
        const { title, scenes: rawScenes, characters: rawCharacters } = await generateStoryContent(params);
        
        const scenesWithIds = rawScenes.map((s, i) => ({ ...s, id: `${Date.now()}-${i}`, imageUrl: undefined }));
        
        const newStory: Story = {
            id: `${Date.now()}`,
            title,
            params,
            scenes: scenesWithIds,
            characters: rawCharacters.map(c => ({...c, imageUrl: undefined})),
            createdAt: Date.now()
        };
        setStory(newStory);
        setCurrentSceneIndex(0);
        
        setLoadingState('generating_images');
        const imagePromises = newStory.scenes.map(scene => generateImage(scene.imagePrompt));
        const imageUrls = await Promise.all(imagePromises);

        setStory(prev => {
            if (!prev) return null;
            const updatedScenes = prev.scenes.map((scene, i) => ({ ...scene, imageUrl: imageUrls[i] }));
            return { ...prev, scenes: updatedScenes };
        });

        setLoadingState('generating_characters');
        const characterImagePromises = newStory.characters.map(char => generateCharacterImage(char.description));
        const characterImageUrls = await Promise.all(characterImagePromises);
        setStory(prev => {
            if (!prev) return null;
            const updatedCharacters = prev.characters.map((char, i) => ({ ...char, imageUrl: characterImageUrls[i] }));
            return { ...prev, characters: updatedCharacters };
        });


        setLoadingState('done');

      } catch (err) {
        setErrorMessage(err instanceof Error ? err.message : 'An unknown error occurred.');
        setLoadingState('error');
      }
    };
    
    if (location.state?.params && !story) {
      generateNewStory(location.state.params);
    } else if (story) {
        setCurrentSceneIndex(0);
        setLoadingState('done');
    } else {
      navigate('/');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state, navigate]);

  const handlePlayPause = () => {
    if (isSpeaking) {
        stop();
    } else if (activeScene && story){
        speak(activeScene.text, story.params.language);
    }
  }

  const handlePlayFullStory = () => {
    if(isPlaying){
        stop();
        setIsPlaying(false);
    } else if (activeScene && story) {
        setIsPlaying(true);
        speak(activeScene.text, story.params.language);
    }
  }

  const handleSave = () => {
    if (story && !isSaved) {
        saveStory(story).then(() => {
            setIsSaved(true);
        });
    }
  }

  const renderContent = () => {
    if (loadingState === 'generating_text' || loadingState === 'idle') {
      return <Loader text="Dreaming up a new story..." />;
    }
    if (loadingState === 'generating_images') {
      return <Loader text="Painting the scenes..." />;
    }
     if (loadingState === 'generating_characters') {
      return <Loader text="Bringing characters to life..." />;
    }
    if (loadingState === 'error') {
      return (
        <div className="p-8 text-center text-red-600">
          <h2 className="text-2xl font-bold mb-4">Oh no!</h2>
          <p>{errorMessage}</p>
          <button onClick={() => navigate('/')} className="mt-6 px-6 py-2 bg-orange-500 text-white rounded-full">Try Again</button>
        </div>
      );
    }
    if (loadingState === 'done' && story) {
        return (
            <div className="w-full h-full flex flex-col">
              <div className="p-4 flex justify-between items-center text-gray-700 z-50">
                <button onClick={() => navigate(-1)} className="font-bold text-sm bg-white/50 px-3 py-1 rounded-full backdrop-blur-sm"> &lt; Back</button>
                <h2 className="font-bold text-lg truncate px-2 text-center flex-1">{story.title}</h2>
                <button onClick={handleSave} className={`${isSaved ? 'text-red-500 cursor-default' : 'text-gray-400'}`} disabled={isSaved}>
                    <HeartIcon isFilled={isSaved}/>
                </button>
              </div>
              <div className="flex-grow relative p-4">
                {scenes.map((scene, index) => {
                    const isCurrent = index === currentSceneIndex;
                    const isPast = index < currentSceneIndex;
                    const isFuture = index > currentSceneIndex;
                    const positionInStack = index - currentSceneIndex;
                    
                    return (
                        <motion.div
                            key={scene.id}
                            className="absolute inset-0"
                            drag={isCurrent ? 'x' : false}
                            dragConstraints={{ left: 0, right: 0 }}
                            onDragEnd={(e, { offset }) => {
                                if (offset.x < -100) handleSwipe('next');
                                else if (offset.x > 100) handleSwipe('previous');
                            }}
                            animate={{
                                x: isCurrent ? '0%' : isPast ? '-120%' : '0%',
                                y: isFuture ? positionInStack * 10 : 0,
                                scale: isFuture ? 1 - positionInStack * 0.05 : 1,
                                rotate: isPast ? -15 : 0,
                                opacity: isCurrent ? 1 : isFuture && positionInStack < 3 ? 1 : 0,
                                zIndex: scenes.length - index
                            }}
                            transition={{ type: 'spring', stiffness: 200, damping: 25 }}
                        >
                            <SceneCard scene={scene} isTop={isCurrent} />
                        </motion.div>
                    )
                })}
              </div>
               <div className="p-4 flex justify-center items-center space-x-4">
                <button onClick={() => handleSwipe('previous')} disabled={currentSceneIndex === 0} className="p-3 bg-white/80 rounded-full shadow-lg backdrop-blur-sm disabled:opacity-50">
                    <ChevronLeftIcon className="text-orange-500 w-8 h-8"/>
                </button>
                <button onClick={handlePlayPause} className="p-3 bg-white/80 rounded-full shadow-lg backdrop-blur-sm">
                    {isSpeaking && !isPlaying ? <PauseIcon className="text-orange-500 w-10 h-10" /> : <PlayIcon className="text-orange-500 w-10 h-10" />}
                </button>
                <button onClick={handlePlayFullStory} className={`px-4 py-3 rounded-full shadow-lg font-bold transition-colors text-sm ${isPlaying ? 'bg-red-500 text-white' : 'bg-orange-500 text-white'}`}>
                    {isPlaying ? 'Stop Story' : 'Play Story'}
                </button>
                <button onClick={() => handleSwipe('next')} disabled={currentSceneIndex === scenes.length - 1} className="p-3 bg-white/80 rounded-full shadow-lg backdrop-blur-sm disabled:opacity-50">
                    <ChevronRightIcon className="text-orange-500 w-8 h-8"/>
                </button>
               </div>
            </div>
        );
    }
    return null;
  };

  return (
    <div className="h-full w-full flex flex-col justify-center items-center overflow-hidden bg-gradient-to-b from-orange-50 to-amber-100">
        {renderContent()}
    </div>
  );
};

export default StoryScreen;

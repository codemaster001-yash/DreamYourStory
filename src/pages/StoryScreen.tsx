

import React, { useState, useEffect, useMemo, useCallback, useRef, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { generateStoryContent, generateImage, generateCharacterImage } from '../services/geminiService';
import { Story, StoryParams, Scene, Character } from '../types';
import Loader from '../components/Loader';
import SceneCard from '../components/SceneCard';
import { useTextToSpeech } from '../hooks/useTextToSpeech';
import { useStoryHistory } from '../hooks/useStoryHistory';
import { PlayIcon, PauseIcon, HeartIcon, ChevronLeftIcon, ChevronRightIcon, HomeIcon } from '../components/icons/Icons';
import { ApiKeyContext } from '../contexts/ApiKeyContext';
import { VoiceContext } from '../contexts/VoiceContext';

type LoadingState = 'idle' | 'generating_text' | 'generating_images' | 'generating_characters' | 'error' | 'done';
type LoadingProgress = {
    state: LoadingState;
    message: string;
};

const StoryScreen: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { saveStory, deleteStory, isStorySaved } = useStoryHistory();
    const { apiKey } = useContext(ApiKeyContext);
    const { voicePreference } = useContext(VoiceContext);

    const [story, setStory] = useState<Story | null>(location.state?.story || null);
    const [loadingProgress, setLoadingProgress] = useState<LoadingProgress>({ state: 'idle', message: '' });
    const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [toastMessage, setToastMessage] = useState<string | null>(null);
    const direction = useRef(1);

    useEffect(() => {
        if (story) {
            setIsSaved(isStorySaved(story.id));
        }
    }, [story, isStorySaved]);

    useEffect(() => {
        if (toastMessage) {
            const timer = setTimeout(() => {
                setToastMessage(null);
            }, 5000); // Hide after 5 seconds
            return () => clearTimeout(timer);
        }
    }, [toastMessage]);

    const scenes = useMemo(() => story?.scenes || [], [story]);
    const activeScene = scenes[currentSceneIndex];

    const handleSwipeRef = useRef<((dir: 'next' | 'previous') => void) | null>(null);

    const handleSpeechEnd = useCallback((_event: SpeechSynthesisEvent) => {
        if (isPlaying && currentSceneIndex < scenes.length - 1) {
            setTimeout(() => {
                handleSwipeRef.current?.('next');
            }, 500);
        } else {
            setIsPlaying(false);
        }
    }, [isPlaying, currentSceneIndex, scenes.length]);

    const { speak, stop, isSpeaking } = useTextToSpeech(handleSpeechEnd, voicePreference);

    const handleSwipe = useCallback((dir: 'next' | 'previous') => {
        stop();
        if (dir === 'next' && currentSceneIndex < scenes.length - 1) {
            direction.current = 1;
            setCurrentSceneIndex(prev => prev + 1);
        } else if (dir === 'previous' && currentSceneIndex > 0) {
            direction.current = -1;
            setCurrentSceneIndex(prev => prev - 1);
        }
    }, [stop, currentSceneIndex, scenes.length]);
    
    useEffect(() => {
      handleSwipeRef.current = handleSwipe;
    }, [handleSwipe]);


    useEffect(() => {
        if (isPlaying && activeScene && story) {
            speak(activeScene.text, story.params.language);
        }
    }, [activeScene, isPlaying, story, speak]);


    useEffect(() => {
        const generateNewStory = async (params: StoryParams) => {
            if (!apiKey) {
                setLoadingProgress({ state: 'error', message: "Please set your API Key in Settings before creating a story." });
                return;
            }
            try {
                // 1. Generate story text and prompts (critical path)
                setLoadingProgress({ state: 'generating_text', message: 'Once upon a time...' });
                const content = await generateStoryContent(params, apiKey);

                const newStory: Story = {
                    id: `story_${Date.now()}`,
                    title: content.title,
                    params: params,
                    scenes: content.scenes.map((s, i) => ({ ...s, id: `scene_${i}` })),
                    characters: content.characters,
                    createdAt: Date.now(),
                };
                setStory(newStory);

                let errorToastShown = false;
                const showToast = (message: string) => {
                    if (!errorToastShown) {
                        setToastMessage(message);
                        errorToastShown = true;
                    }
                }

                // 2. Generate scene images (non-critical)
                setLoadingProgress({ state: 'generating_images', message: 'Painting the scenes...' });
                const sceneImagePromises = newStory.scenes.map(scene => generateImage(scene.imagePrompt, apiKey));
                const sceneResults = await Promise.allSettled(sceneImagePromises);

                sceneResults.forEach((result, index) => {
                    if (result.status === 'fulfilled') {
                        setStory(currentStory => {
                            if (!currentStory) return null;
                            const updatedScenes = [...currentStory.scenes];
                            if (updatedScenes[index]) updatedScenes[index].imageUrl = result.value;
                            return { ...currentStory, scenes: updatedScenes };
                        });
                    } else {
                        console.error(`Failed to generate image for scene ${index}:`, result.reason);
                        showToast("Some images couldn't be created, but the story continues!");
                    }
                });
                
                // 3. Generate character portraits (non-critical)
                setLoadingProgress({ state: 'generating_characters', message: 'Meeting the characters...' });
                const characterImagePromises = newStory.characters.map(character => generateCharacterImage(character.description, apiKey));
                const characterResults = await Promise.allSettled(characterImagePromises);

                characterResults.forEach((result, index) => {
                     if (result.status === 'fulfilled') {
                        setStory(currentStory => {
                            if (!currentStory) return null;
                            const updatedCharacters = [...currentStory.characters];
                            if (updatedCharacters[index]) updatedCharacters[index].imageUrl = result.value;
                            return { ...currentStory, characters: updatedCharacters };
                        });
                    } else {
                        console.error(`Failed to generate image for character ${index}:`, result.reason);
                        showToast("A character portrait couldn't be created, but the story goes on!");
                    }
                });

                setLoadingProgress({ state: 'done', message: 'Your story is ready!' });

            } catch (error) {
                console.error("Critical story generation failed:", error);
                const message = error instanceof Error ? error.message : "An unknown error occurred.";
                setLoadingProgress({ state: 'error', message });
            }
        };

        if (!story && location.state?.params) {
            generateNewStory(location.state.params);
        } else if(story) {
             setLoadingProgress({ state: 'done', message: '' });
        }

    }, [location.state, story, navigate, apiKey]);
    
    const handleToggleSave = () => {
        if (!story) return;
        if (isSaved) {
            deleteStory(story.id);
            setIsSaved(false);
        } else {
            saveStory(story);
            setIsSaved(true);
        }
    };
    
    const togglePlayPause = () => {
      if (isSpeaking) {
        stop();
        setIsPlaying(false);
      } else {
        setIsPlaying(true);
      }
    };

    const renderContent = () => {
        if (loadingProgress.state !== 'done' && loadingProgress.state !== 'error') {
            return <div className="w-full h-full flex items-center justify-center"><Loader text={loadingProgress.message} /></div>;
        }

        if (loadingProgress.state === 'error') {
            return (
                <div className="flex flex-col items-center justify-center text-center p-8 h-full">
                    <h2 className="text-2xl font-bold text-red-500">Oh no!</h2>
                    <p className="mt-2 text-gray-600">{loadingProgress.message}</p>
                    <button onClick={() => navigate('/')} className="mt-6 px-6 py-3 bg-orange-500 text-white font-bold rounded-full shadow-lg hover:bg-orange-600">
                        Try Again
                    </button>
                </div>
            );
        }

        if (!story || scenes.length === 0) {
            return (
                <div className="text-center p-8">
                     <p className="text-gray-500">Something went wrong. Story not found.</p>
                     <button onClick={() => navigate('/')} className="mt-4 px-6 py-2 bg-orange-500 text-white font-bold rounded-full shadow-md hover:bg-orange-600">
                        Go Home
                    </button>
                </div>
            )
        }
        
        const variants = {
            enter: (direction: number) => ({
                x: direction > 0 ? 1000 : -1000,
                opacity: 0,
            }),
            center: {
                zIndex: 1,
                x: 0,
                opacity: 1,
            },
            exit: (direction: number) => ({
                zIndex: 0,
                x: direction < 0 ? 1000 : -1000,
                opacity: 0,
            }),
        };

        return (
            <div className="w-full h-full flex flex-col items-center justify-center p-4 relative overflow-hidden">
                <div className="w-full aspect-[9/16] max-w-sm max-h-full relative">
                    <AnimatePresence initial={false} custom={direction.current}>
                        <motion.div
                            key={currentSceneIndex}
                            className="w-full h-full absolute"
                            custom={direction.current}
                            variants={variants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{
                                x: { type: 'spring', stiffness: 300, damping: 30 },
                                opacity: { duration: 0.2 },
                            }}
                            drag="x"
                            dragConstraints={{ left: 0, right: 0 }}
                            dragElastic={1}
                            onDragEnd={(_e, { offset, velocity }) => {
                                const swipe = Math.abs(offset.x) * velocity.x;
                                if (swipe < -10000) {
                                    handleSwipe('next');
                                } else if (swipe > 10000) {
                                    handleSwipe('previous');
                                }
                            }}
                        >
                            <SceneCard scene={scenes[currentSceneIndex]} isTop={true} />
                        </motion.div>
                    </AnimatePresence>
                </div>
                 <div className="absolute top-4 left-4 z-10">
                    <button onClick={() => navigate('/')} className="bg-white/70 backdrop-blur-sm p-2 rounded-full shadow-md text-gray-700 hover:bg-white">
                        <HomeIcon className="w-6 h-6" />
                    </button>
                </div>
                 <div className="absolute top-4 right-4 z-10">
                    <button onClick={handleToggleSave} className={`bg-white/70 backdrop-blur-sm p-2 rounded-full shadow-md ${isSaved ? 'text-red-500' : 'text-gray-600'} hover:bg-white`}>
                        <HeartIcon isFilled={isSaved} className="w-6 h-6" />
                    </button>
                </div>

                <div className="mt-4 flex items-center justify-center space-x-8">
                     <button onClick={() => handleSwipe('previous')} disabled={currentSceneIndex === 0} className="text-orange-500 disabled:text-gray-300 p-2">
                        <ChevronLeftIcon className="w-10 h-10" />
                    </button>
                    <button onClick={togglePlayPause} className="text-orange-500 p-2">
                        {isSpeaking ? <PauseIcon className="w-16 h-16"/> : <PlayIcon className="w-16 h-16"/>}
                    </button>
                     <button onClick={() => handleSwipe('next')} disabled={currentSceneIndex === scenes.length - 1} className="text-orange-500 disabled:text-gray-300 p-2">
                        <ChevronRightIcon className="w-10 h-10" />
                    </button>
                </div>
                
                <AnimatePresence>
                    {toastMessage && (
                        <motion.div
                            initial={{ opacity: 0, y: 50, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 20, scale: 0.9 }}
                            className="absolute bottom-28 z-20 bg-red-500/90 backdrop-blur-sm text-white px-4 py-2 rounded-xl shadow-lg text-sm text-center"
                        >
                            {toastMessage}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        );
    };

    return renderContent();
};

export default StoryScreen;
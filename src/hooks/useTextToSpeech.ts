import { useState, useEffect, useCallback } from 'react';
import { VoicePreference } from '../types';

export const useTextToSpeech = (onEndCallback: (event: SpeechSynthesisEvent) => void, voicePreference: VoicePreference) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  const synth = window.speechSynthesis;

  useEffect(() => {
    const getVoices = () => {
      const availableVoices = synth.getVoices();
      if (availableVoices.length > 0) {
        setVoices(availableVoices);
      }
    };
    
    getVoices();
    if (synth.onvoiceschanged !== undefined) {
      synth.onvoiceschanged = getVoices;
    }
  }, [synth]);

  const findBestVoice = useCallback((lang: string, pref: VoicePreference): SpeechSynthesisVoice | null => {
    if (voices.length === 0 || pref === 'auto') return null;

    const langCode = lang.split('-')[0].toLowerCase();
    const candidates = voices.filter(voice => voice.lang.toLowerCase().startsWith(langCode));
    if (candidates.length === 0) return null;

    let bestScore = -1;
    let bestVoice: SpeechSynthesisVoice | null = null;
    
    for (const voice of candidates) {
        let score = 0;
        const name = voice.name.toLowerCase();
        
        // Higher score for more natural-sounding voices if detectable
        if (name.includes('neural') || name.includes('premium') || name.includes('enhanced')) {
            score += 20;
        }

        const isMale = name.includes('male');
        const isFemale = name.includes('female');

        if (pref === 'male') {
            if (isMale) score += 10;
            if (isFemale) score -= 10;
        } else if (pref === 'female') {
            if (isFemale) score += 10;
            if (isMale) score -= 10;
        } else if (pref === 'boy' || pref === 'girl') {
            if (name.includes('child') || name.includes('kid')) score += 10;
            if (isMale && pref === 'girl') score -= 10;
            if (isFemale && pref === 'boy') score -= 10;
        }

        // Avoid robotic/generic names if better options exist
        if (name.includes('desktop') || name.includes('microsoft') || name.includes('google')) {
            score -= 2;
        }

        if (score > bestScore) {
            bestScore = score;
            bestVoice = voice;
        }
    }

    return bestVoice || candidates[0]; // Fallback to the first available voice for the language
  }, [voices]);

  const speak = useCallback((text: string, lang: string) => {
    if (synth.speaking) {
      synth.cancel();
    }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    
    const bestVoice = findBestVoice(lang, voicePreference);
    if (bestVoice) {
      utterance.voice = bestVoice;
    }

    utterance.onstart = () => {
        setIsSpeaking(true);
        setIsPaused(false);
    };
    utterance.onend = (event) => {
      setIsSpeaking(false);
      setIsPaused(false);
      onEndCallback(event);
    };
    utterance.onerror = (e) => {
      console.error("SpeechSynthesis Error", e);
      setIsSpeaking(false);
      setIsPaused(false);
    };
    synth.speak(utterance);
  }, [synth, onEndCallback, findBestVoice, voicePreference]);

  const pause = useCallback(() => {
    if(synth.speaking && !synth.paused) {
        synth.pause();
        setIsPaused(true);
    }
  }, [synth]);

  const resume = useCallback(() => {
    if(synth.paused) {
        synth.resume();
        setIsPaused(false);
    }
  }, [synth]);

  const stop = useCallback(() => {
    if (synth.speaking) {
      synth.cancel();
      setIsSpeaking(false);
      setIsPaused(false);
    }
  }, [synth]);

  useEffect(() => {
    return () => {
      stop();
    };
  }, [stop]);

  return { speak, pause, resume, stop, isSpeaking, isPaused };
};

import { useState, useEffect, useCallback } from 'react';

export const useTextToSpeech = (onEndCallback: () => void) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const synth = window.speechSynthesis;

  const speak = useCallback((text: string, lang: string) => {
    if (synth.speaking) {
      synth.cancel();
    }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.onstart = () => {
        setIsSpeaking(true);
        setIsPaused(false);
    };
    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
      onEndCallback();
    };
    utterance.onerror = (e) => {
      console.error("SpeechSynthesis Error", e);
      setIsSpeaking(false);
      setIsPaused(false);
    };
    synth.speak(utterance);
  }, [synth, onEndCallback]);

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

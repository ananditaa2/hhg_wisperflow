import { useState, useEffect, useRef, useCallback } from 'react';

interface SpeechRecognitionHook {
  isListening: boolean;
  transcript: string;
  interimTranscript: string;
  lastCommand: string;
  isSupported: boolean;
  startListening: () => void;
  stopListening: () => void;
  resetTranscript: () => void;
}

export function useSpeechRecognition(onCommandDetected?: (cmd: string) => void): SpeechRecognitionHook {
  const [isListening, setIsListening] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>('');
  const [interimTranscript, setInterimTranscript] = useState<string>('');
  const [lastCommand, setLastCommand] = useState<string>('');
  const [isSupported, setIsSupported] = useState<boolean>(true);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Check browser support
    const SpeechRecognition = 
      (window as unknown as { SpeechRecognition?: any; webkitSpeechRecognition?: any }).SpeechRecognition ||
      (window as unknown as { SpeechRecognition?: any; webkitSpeechRecognition?: any }).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      recognition.onresult = (event: any) => {
        let currentInterim = '';
        let finalChunk = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const text = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalChunk += text + ' ';
          } else {
            currentInterim += text;
          }
        }

        if (finalChunk) {
          setTranscript(prev => (prev + ' ' + finalChunk).trim());
          const cleaned = finalChunk.trim().toLowerCase();
          setLastCommand(cleaned);
          if (onCommandDetected) {
            onCommandDetected(cleaned);
          }
        }
        setInterimTranscript(currentInterim);
      };

      recognition.onerror = (event: { error: string }) => {
        if (event.error !== 'no-speech') {
          console.warn('Speech recognition warning:', event.error);
        }
      };

      recognition.onend = () => {
        // Auto-restart if user still wants it active
        if (recognitionRef.current?.shouldKeepAlive) {
          try {
            recognition.start();
          } catch {
            // Already started or suspended
          }
        } else {
          setIsListening(false);
        }
      };

      recognitionRef.current = recognition;
    } catch {
      setIsSupported(false);
    }
  }, [onCommandDetected]);

  const startListening = useCallback(() => {
    if (!recognitionRef.current) return;
    try {
      recognitionRef.current.shouldKeepAlive = true;
      recognitionRef.current.start();
      setIsListening(true);
    } catch {
      // recognition may already be running
      setIsListening(true);
    }
  }, []);

  const stopListening = useCallback(() => {
    if (!recognitionRef.current) return;
    recognitionRef.current.shouldKeepAlive = false;
    try {
      recognitionRef.current.stop();
    } catch {
      // Already stopped
    }
    setIsListening(false);
    setInterimTranscript('');
  }, []);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
    setLastCommand('');
  }, []);

  return {
    isListening,
    transcript,
    interimTranscript,
    lastCommand,
    isSupported,
    startListening,
    stopListening,
    resetTranscript
  };
}

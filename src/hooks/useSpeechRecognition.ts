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

  // Store callback in a ref — never stale, never causes re-creation of the recognition instance
  const callbackRef = useRef(onCommandDetected);
  useEffect(() => {
    callbackRef.current = onCommandDetected;
  }, [onCommandDetected]);

  // Create recognition instance ONCE on mount only
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
      recognition.maxAlternatives = 1;

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
          // Use ref so callback is always fresh, never stale
          if (callbackRef.current) {
            callbackRef.current(cleaned);
          }
        }
        setInterimTranscript(currentInterim);
      };

      recognition.onerror = (event: { error: string }) => {
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed' || event.error === 'network') {
          recognition.shouldKeepAlive = false;
          setIsSupported(false);
          setIsListening(false);
          if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
            console.error('Microphone permission denied.');
          }
        }
        if (event.error !== 'no-speech') {
          console.warn('Speech recognition warning:', event.error);
        }
      };

      recognition.onend = () => {
        // Auto-restart continuous listening if user still wants it
        if (recognitionRef.current?.shouldKeepAlive) {
          try {
            recognition.start();
          } catch {
            // Already started or in a bad state
          }
        } else {
          setIsListening(false);
        }
      };

      recognitionRef.current = recognition;
    } catch {
      setIsSupported(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // <-- Empty deps: instance created ONCE, callback accessed via ref

  const startListening = useCallback(() => {
    if (!recognitionRef.current) return;
    try {
      setIsSupported(true);
      recognitionRef.current.shouldKeepAlive = true;
      recognitionRef.current.start();
      setIsListening(true);
    } catch {
      // Recognition may already be running
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
    resetTranscript,
  };
}

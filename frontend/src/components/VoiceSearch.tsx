import { useState, useEffect, useRef, useCallback } from 'react';
import { Mic, MicOff, AudioLines, WifiOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface VoiceSearchProps {
  onResult: (transcript: string) => void;
  onListening?: (listening: boolean) => void;
}

export function VoiceSearch({ onResult, onListening }: VoiceSearchProps) {
  // Bail out immediately if previously failed on this session
  const [dead] = useState(() => sessionStorage.getItem('voice-search-disabled') === '1');

  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const recognitionRef = useRef<any>(null);
  const [audioLevel, setAudioLevel] = useState(0);
  const animFrameRef = useRef<number>(undefined);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Keep stable refs to callbacks so the recognition setup doesn't re-run
  const onResultRef = useRef(onResult);
  const onListeningRef = useRef(onListening);
  useEffect(() => { onResultRef.current = onResult; }, [onResult]);
  useEffect(() => { onListeningRef.current = onListening; }, [onListening]);

  // Check basics
  const SpeechRecognition = typeof window !== 'undefined'
    ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    : null;
  const supported = !!SpeechRecognition && !dead;

  useEffect(() => {
    if (!SpeechRecognition || dead) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: any) => {
      const current = event.results[event.results.length - 1];
      const text = current[0].transcript;
      setTranscript(text);
      if (current.isFinal) {
        onResultRef.current(text);
        stopEverything();
      }
    };

    recognition.onerror = (e: any) => {
      stopEverything();

      // Fatal errors — kill the feature for the entire browser session
      if (e.error === 'network' || e.error === 'service-not-allowed') {
        sessionStorage.setItem('voice-search-disabled', '1');
        recognitionRef.current = null; // prevent further use
        return;
      }

      const messages: Record<string, string> = {
        'not-allowed': 'Microphone access denied. Allow it in browser settings.',
        'no-speech': 'No speech detected. Try again.',
        aborted: '',
        'audio-capture': 'No microphone found.',
      };
      const msg = messages[e.error] || `Speech error: ${e.error}`;
      if (msg) setErrorMsg(msg);
    };

    recognition.onend = () => {
      stopEverything();
    };

    recognitionRef.current = recognition;

    return () => {
      try { recognition.abort(); } catch {}
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      streamRef.current?.getTracks().forEach(t => t.stop());
    };
  }, []); // stable — runs once

  const stopEverything = useCallback(() => {
    setIsListening(false);
    onListeningRef.current?.(false);
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = undefined;
    }
    setAudioLevel(0);
  }, []);

  const startAudioVisualization = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const audioCtx = new AudioContext();
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const tick = () => {
        analyser.getByteFrequencyData(dataArray);
        const avg = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
        setAudioLevel(avg / 255);
        animFrameRef.current = requestAnimationFrame(tick);
      };
      tick();
    } catch {
      // Microphone not available — speech recognition may still work without visualization
    }
  }, []);

  const toggleListening = useCallback(() => {
    if (!recognitionRef.current) return;
    setErrorMsg('');

    if (isListening) {
      try { recognitionRef.current.stop(); } catch {}
      stopEverything();
    } else {
      setTranscript('');
      try {
        recognitionRef.current.start();
        setIsListening(true);
        onListeningRef.current?.(true);
        startAudioVisualization();
      } catch (err: any) {
        console.warn('[VoiceSearch] start failed:', err);
        setErrorMsg('Could not start voice recognition. Try refreshing the page.');
        stopEverything();
      }
    }
  }, [isListening, stopEverything, startAudioVisualization]);

  // Auto-dismiss error after 4 seconds
  useEffect(() => {
    if (!errorMsg) return;
    const t = setTimeout(() => setErrorMsg(''), 4000);
    return () => clearTimeout(t);
  }, [errorMsg]);

  if (!supported) return null;

  return (
    <div className="relative">
      <button
        onClick={toggleListening}
        className={`relative w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
          isListening
            ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
            : 'bg-white/10 text-zinc-400 hover:bg-white/20 hover:text-white'
        }`}
        title="Voice search"
      >
        {/* Pulse rings when listening */}
        <AnimatePresence>
          {isListening && (
            <>
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: [1, 2.5], opacity: [0.4, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut' }}
                className="absolute inset-0 rounded-full border-2 border-red-400/40"
              />
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: [1, 2], opacity: [0.3, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut', delay: 0.3 }}
                className="absolute inset-0 rounded-full border border-red-400/30"
              />
            </>
          )}
        </AnimatePresence>

        {/* Audio level ring */}
        {isListening && (
          <motion.div
            className="absolute inset-[-4px] rounded-full border-2 border-red-400"
            style={{ opacity: 0.3 + audioLevel * 0.7, transform: `scale(${1 + audioLevel * 0.3})` }}
          />
        )}

        {isListening ? <MicOff size={18} /> : <Mic size={18} />}
      </button>

      {/* Floating transcript */}
      <AnimatePresence>
        {isListening && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute top-full right-0 mt-3 bg-zinc-950/95 backdrop-blur-xl border border-zinc-800 rounded-2xl p-4 min-w-[240px] max-w-[320px] shadow-2xl shadow-black/50 z-50"
          >
            <div className="flex items-center gap-2 mb-2">
              <AudioLines size={14} className="text-red-400 animate-pulse" />
              <span className="text-xs text-red-400 font-medium uppercase tracking-wider">Listening...</span>
            </div>
            
            {/* Waveform visualization */}
            <div className="flex items-center gap-[2px] h-8 mb-2">
              {Array.from({ length: 24 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="w-[3px] bg-gradient-to-t from-red-500 to-red-300 rounded-full"
                  animate={{
                    height: isListening ? [4, 4 + audioLevel * 28 * Math.sin((i + Date.now() / 200) * 0.5), 4] : 4,
                  }}
                  transition={{ duration: 0.15, repeat: Infinity, delay: i * 0.02 }}
                />
              ))}
            </div>

            <p className="text-sm text-zinc-300 min-h-[20px]">
              {transcript || <span className="text-zinc-600 italic">Say a molecule name...</span>}
            </p>
          </motion.div>
        )}

        {/* Error toast */}
        {errorMsg && !isListening && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute top-full right-0 mt-3 bg-zinc-950/95 backdrop-blur-xl border border-rose-500/30 rounded-2xl p-4 min-w-[260px] max-w-[320px] shadow-2xl shadow-black/50 z-50"
          >
            <div className="flex items-start gap-2.5">
              <WifiOff size={14} className="text-rose-400 mt-0.5 shrink-0" />
              <div>
                <span className="text-xs text-rose-400 font-medium block mb-1">Voice Search Unavailable</span>
                <p className="text-xs text-zinc-400 leading-relaxed">{errorMsg}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

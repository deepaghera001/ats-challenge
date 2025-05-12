"use client";

import { useState, useRef, useCallback } from 'react';

export function useTimer() {
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const startTimer = useCallback(() => {
    setStartTime(Date.now());
    setElapsedTime(0);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    intervalRef.current = setInterval(() => {
      setElapsedTime(prevTime => prevTime + 1);
    }, 1000);
  }, []);

  const stopTimer = useCallback((): number => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (startTime) {
      const endTime = Date.now();
      const duration = Math.round((endTime - startTime) / 1000);
      setElapsedTime(duration); // Final update to elapsed time
      setStartTime(null);
      return duration;
    }
    return elapsedTime; // return current elapsedTime if startTime was null
  }, [startTime, elapsedTime]);

  const resetTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setStartTime(null);
    setElapsedTime(0);
  }, []);

  return { startTimer, stopTimer, resetTimer, elapsedTimeSeconds: elapsedTime };
}

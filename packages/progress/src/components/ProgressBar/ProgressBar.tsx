import { useState, useEffect } from 'react';

export interface ProgressBarProps {
  id: string;
  testId?: string;
  initialValue?: number;
}

export const ProgressBar = ({
  id,
  testId = 'progress-bar',
  initialValue = 0,
}: ProgressBarProps) => {
  const [progress, setProgress] = useState(initialValue);

  useEffect(() => {
    const handler = (e: Event) => {
      if (e instanceof CustomEvent) {
        setProgress(e.detail);
      }
    };
    window.addEventListener(`progress-${id}`, handler);
    return () => window.removeEventListener(`progress-${id}`, handler);
  }, [id]);

  return (
    <progress
      value={progress}
      max={100}
      data-testid={testId}
    />
  );
};

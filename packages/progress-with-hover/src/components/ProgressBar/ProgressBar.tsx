import { useState, useEffect } from 'react';

export interface ProgressBarProps {
  id: string;
  testId?: string;
  initialValue?: number;
}

const styles = `
  .progress-wrapper {
    position: relative;
    display: inline-block;
  }
  .progress-popover {
    display: none;
    position: absolute;
    top: 80%;
    left: 50%;
    transform: translateX(-50%);
    padding: 4px 6px;
    background: #333;
    color: #fff;
    border-radius: 100vw;
    font-family: sans-serif;
    font-size: 12px;
    white-space: nowrap;
  }
  .progress-wrapper:hover .progress-popover {
    display: block;
  }
`;

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
    <div className="progress-wrapper">
      <style>{styles}</style>
      <progress
        value={progress}
        max={100}
        data-testid={testId}
      />
      <div
        className="progress-popover"
        data-testid={`${testId}-popover`}
      >
        {progress}%
      </div>
    </div>
  );
};

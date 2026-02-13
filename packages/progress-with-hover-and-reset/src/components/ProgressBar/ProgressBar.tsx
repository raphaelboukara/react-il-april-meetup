const styles = `
  .progress-wrapper {
    position: relative;
    display: inline-flex;
    align-items: center;
    gap: 4px;
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
  .progress-reset-btn {
    border: none;
    background: #e0e0e0;
    color: #333;
    border-radius: 4px;
    padding: 2px 6px;
    font-size: 12px;
    cursor: pointer;
    font-family: sans-serif;
  }
  .progress-reset-btn:hover {
    background: #ccc;
  }
`;

export interface ProgressBarProps {
  value: number;
  onReset: () => void;
  testId?: string;
}

export const ProgressBar = ({
  value,
  onReset,
  testId = 'progress-bar',
}: ProgressBarProps) => {
  return (
    <div className="progress-wrapper">
      <style>{styles}</style>
      <progress
        value={value}
        max={100}
        data-testid={testId}
      />
      <div
        className="progress-popover"
        data-testid={`${testId}-popover`}
      >
        {value}%
      </div>
      <button
        className="progress-reset-btn"
        data-testid={`${testId}-reset`}
        onClick={onReset}
      >
        ✕
      </button>
    </div>
  );
};

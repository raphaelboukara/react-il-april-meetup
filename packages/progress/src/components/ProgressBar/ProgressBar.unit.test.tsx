import { render, screen, cleanup, act } from '@testing-library/react';
import { it, expect, afterEach } from 'vitest';
import { ProgressBar } from './ProgressBar';

afterEach(() => {
  cleanup();
});

it('should update progress when receiving a window event', () => {
  render(<ProgressBar id="upload" testId="pb" />);

  for (let i = 5; i <= 100; i = i + 5) {
    window.dispatchEvent(new CustomEvent('progress-upload', { detail: i }));
    expect(screen.getByTestId('pb')).toHaveValue(i);
  }
});

import { render, screen, cleanup, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { it, expect, afterEach } from 'vitest';
import { ProgressBar } from './ProgressBar';

afterEach(() => {
  cleanup();
});

it('should show popover with progress value on hover', async () => {
  render(<ProgressBar id="upload" testId="pb" />);

  for (let i = 5; i <= 100; i = i + 5) {
    act(() => {
      window.dispatchEvent(new CustomEvent('progress-upload', { detail: i }));
    });

    expect(screen.getByTestId('pb-popover')).not.toBeVisible();

    await userEvent.hover(screen.getByTestId('pb'));

    expect(screen.getByTestId('pb-popover')).toBeVisible();
    expect(screen.getByTestId('pb-popover')).toHaveTextContent(`${i}%`);

    await userEvent.unhover(screen.getByTestId('pb'));
  }
});

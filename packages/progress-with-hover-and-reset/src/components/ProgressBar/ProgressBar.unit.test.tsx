import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { it, expect, vi, afterEach } from 'vitest';
import { ProgressBar } from './ProgressBar';

afterEach(() => {
  cleanup();
});

it('should show popover with progress value on hover', async () => {
  const onReset = vi.fn();
  render(<ProgressBar value={75} onReset={onReset} testId="pb" />);

  expect(screen.getByTestId('pb')).toHaveValue(75);
  expect(screen.getByTestId('pb-popover')).not.toBeVisible();

  await userEvent.hover(screen.getByTestId('pb'));

  expect(screen.getByTestId('pb-popover')).toBeVisible();
  expect(screen.getByTestId('pb-popover')).toHaveTextContent('75%');

  await userEvent.unhover(screen.getByTestId('pb'));
});

it('should call onReset when clicking the reset button', async () => {
  const onReset = vi.fn();
  render(<ProgressBar value={50} onReset={onReset} testId="pb" />);

  await userEvent.click(screen.getByTestId('pb-reset'));

  expect(onReset).toHaveBeenCalledOnce();
});

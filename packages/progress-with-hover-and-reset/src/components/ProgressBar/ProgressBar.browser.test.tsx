import { render } from 'vitest-browser-react';
import { it, expect, vi } from 'vitest';
import { ProgressBar } from './ProgressBar';
import { userEvent } from 'vitest/browser';
import { ProgressBarTestkit } from './ProgressBar.testkit';

it('should show popover with progress value on hover', async () => {
  const progressBar = new ProgressBarTestkit(document.body, userEvent, 'pb');
  await render(<ProgressBar value={75} onReset={() => {}} testId="pb" />);

  expect(progressBar.getProgressElement()).toBeInTheDocument();
  expect(progressBar.getProgressValue()).toBe(75);

  await progressBar.hover();

  expect(progressBar.getPopoverElement()).toBeVisible();
  expect(progressBar.getProgressPopoverText()).toBe('75%');

  await progressBar.unhover();
});

it('should call onReset when clicking the reset button', async () => {
  const progressBar = new ProgressBarTestkit(document.body, userEvent, 'pb');
  const onReset = vi.fn();
  await render(<ProgressBar value={50} onReset={onReset} testId="pb" />);

  await progressBar.clickReset();

  expect(onReset).toHaveBeenCalledOnce();
});

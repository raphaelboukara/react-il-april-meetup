import { render } from 'vitest-browser-react';
import { it, expect } from 'vitest';
import { ProgressBar } from './ProgressBar';
import { page, userEvent } from 'vitest/browser';

it('should show popover with progress value on hover', async () => {
  await render(<ProgressBar id="upload" testId="pb" />);

  for (let i = 5; i <= 100; i = i + 5) {
    window.dispatchEvent(new CustomEvent('progress-upload', { detail: i }));

    await expect.element(page.getByTestId('pb-popover')).not.toBeVisible();

    await userEvent.hover(page.getByTestId('pb'));

    await expect.element(page.getByTestId('pb-popover')).toBeVisible();
    await expect.element(page.getByTestId('pb-popover')).toHaveTextContent(`${i}%`);

    await userEvent.unhover(page.getByTestId('pb'));
  }
});

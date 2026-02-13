import { render } from 'vitest-browser-react';
import { it, expect, vi } from 'vitest';
import { ProgressBar } from './ProgressBar';
import { page } from 'vitest/browser';

it('should update progress when receiving a window event', async () => {
  await render(<ProgressBar id="upload" testId="pb" />);

  for (let i = 5; i <= 100; i = i + 5) {
    window.dispatchEvent(new CustomEvent('progress-upload', { detail: i }));
    await vi.waitFor(() => {
      expect(page.getByTestId('pb').element()).toHaveValue(i);
    });
  }
});

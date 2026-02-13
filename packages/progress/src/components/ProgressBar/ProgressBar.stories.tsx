import { useEffect } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { ProgressBar } from './ProgressBar';

const meta: Meta<typeof ProgressBar> = {
  title: 'Components/ProgressBar',
  component: ProgressBar,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ProgressBar>;

export const Default: Story = {
  args: { id: 'upload', testId: 'progress-bar' },
  render: (args) => {
    useEffect(() => {
      window.dispatchEvent(new CustomEvent('progress-upload', { detail: 60 }));
    }, []);
    return <ProgressBar {...args} />;
  },
};

export const Empty: Story = {
  args: { id: 'download', testId: 'progress-bar-empty' },
};

export const Full: Story = {
  args: { id: 'sync', testId: 'progress-bar-full' },
  render: (args) => {
    useEffect(() => {
      window.dispatchEvent(new CustomEvent('progress-sync', { detail: 100 }));
    }, []);
    return <ProgressBar {...args} />;
  },
};

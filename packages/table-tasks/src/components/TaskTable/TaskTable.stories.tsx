import type { Meta, StoryObj } from '@storybook/react';
import { TaskTable, Task } from './TaskTable';

const meta: Meta<typeof TaskTable> = {
  title: 'Components/TaskTable',
  component: TaskTable,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof TaskTable>;

const sampleTasks: Task[] = [
  { id: 'design', name: 'Design mockups', progress: 100 },
  { id: 'api', name: 'Build API endpoints', progress: 75 },
  { id: 'frontend', name: 'Frontend implementation', progress: 40 },
  { id: 'testing', name: 'Write tests', progress: 10 },
  { id: 'deploy', name: 'Deploy to production', progress: 0 },
];

export const Default: Story = {
  args: {
    tasks: sampleTasks,
  },
};

import { render } from 'vitest-browser-react';
import { it, expect, describe } from 'vitest';
import { TaskTable, Task } from './TaskTable';
import { TEST_IDS } from './TaskTable.testIds';
import { page, userEvent } from 'vitest/browser';
import { ProgressBarTestkit } from '@demo/progress-with-hover-and-reset';

const tasks: Task[] = [
  { id: '123', name: 'Design mockups', progress: 80 },
  { id: '456', name: 'Build API', progress: 30 },
];

describe('TaskTable', () => {
  it('should render progress bars with initial values', async () => {
    const designProgress = new ProgressBarTestkit(
      document.body,
      userEvent,
      TEST_IDS.PROGRESS_TASK_TABLE('123'),
    );
    const apiProgress = new ProgressBarTestkit(
      document.body,
      userEvent,
      TEST_IDS.PROGRESS_TASK_TABLE('456'),
    );

    await render(<TaskTable tasks={tasks} />);

    expect(designProgress.getProgressElement()).toBeInTheDocument();
    expect(designProgress.getProgressValue()).toBe(80);
    expect(apiProgress.getProgressElement()).toBeInTheDocument();
    expect(apiProgress.getProgressValue()).toBe(30);
  });

  it('should show popover on hover and reset progress on reset click', async () => {
    const designProgress = new ProgressBarTestkit(
      document.body,
      userEvent,
      TEST_IDS.PROGRESS_TASK_TABLE('123'),
    );
    const apiProgress = new ProgressBarTestkit(
      document.body,
      userEvent,
      TEST_IDS.PROGRESS_TASK_TABLE('456'),
    );

    await render(<TaskTable tasks={tasks} />);

    expect(designProgress.getProgressElement()).toBeInTheDocument();
    expect(designProgress.getProgressValue()).toBe(80);

    await designProgress.hover();
    expect(designProgress.getPopoverElement()).toBeVisible();
    expect(designProgress.getProgressPopoverText()).toBe('80%');
    await designProgress.unhover();

    await designProgress.clickReset();

    expect(designProgress.getProgressValue()).toBe(0);
    expect(apiProgress.getProgressValue()).toBe(30);
  });

  it('should render an empty table when no tasks are provided', async () => {
    await render(<TaskTable tasks={[]} />);
    await expect.element(page.getByTestId(TEST_IDS.TASKS_TABLE)).toBeInTheDocument();
  });
});

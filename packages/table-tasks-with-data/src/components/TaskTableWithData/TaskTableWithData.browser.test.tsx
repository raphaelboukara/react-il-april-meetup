import { render } from 'vitest-browser-react';
import { it, expect, describe, beforeAll, afterAll, afterEach } from 'vitest';
import {
  TaskTableWithData,
  TASK_TABLE_LOADING_TEST_ID,
  TASK_TABLE_ERROR_TEST_ID,
  TASK_TABLE_WITH_DATA_ERROR_MESSAGE,
} from './TaskTableWithData';
import { TEST_IDS } from '@demo/table-tasks';
import { page, userEvent } from 'vitest/browser';
import { ProgressBarTestkit } from '@demo/progress-with-hover-and-reset';
import { http, HttpResponse } from 'msw';
import { setupWorker } from 'msw/browser';

const worker = setupWorker(
  http.get('/api/tasks', () => HttpResponse.json([])),
);

beforeAll(async () => {
  await worker.start({ onUnhandledRequest: 'bypass' });
});

afterEach(() => {
  worker.resetHandlers();
});

afterAll(() => {
  worker.stop();
});

describe('TaskTableWithData', () => {
  it('shows loading, then progress values after the HTTP response', async () => {
    worker.use(
      http.get('/api/tasks', async () => {
        await new Promise((r) => setTimeout(r, 150));
        return HttpResponse.json([
          { id: 'design', name: 'Design mockups', progress: 80 },
          { id: 'api', name: 'Build API', progress: 30 },
        ]);
      }),
    );

    await render(<TaskTableWithData />);

    await expect
      .poll(() => page.getByTestId(TASK_TABLE_LOADING_TEST_ID))
      .toBeInTheDocument();

    await expect
      .poll(() => page.getByTestId(TEST_IDS.TASKS_TABLE))
      .toBeInTheDocument();

    const tableRoot = page.getByTestId(TEST_IDS.TASKS_TABLE).element() as HTMLElement;
    const designProgress = new ProgressBarTestkit(
      tableRoot,
      userEvent,
      TEST_IDS.PROGRESS_TASK_TABLE('design'),
    );
    const apiProgress = new ProgressBarTestkit(
      tableRoot,
      userEvent,
      TEST_IDS.PROGRESS_TASK_TABLE('api'),
    );

    await expect.poll(() => designProgress.getProgressElement()).toBeInTheDocument();
    expect(designProgress.getProgressValue()).toBe(80);

    await expect.poll(() => apiProgress.getProgressElement()).toBeInTheDocument();
    expect(apiProgress.getProgressValue()).toBe(30);

    await designProgress.hover();
    expect(designProgress.getPopoverElement()).toBeVisible();
    expect(designProgress.getProgressPopoverText()).toBe('80%');
    await designProgress.unhover();
  });

  it('shows an error message when the request fails', async () => {
    worker.use(
      http.get('/api/tasks', () => HttpResponse.json({ message: 'nope' }, { status: 500 })),
    );

    await render(<TaskTableWithData />);

    await expect
      .poll(() => page.getByTestId(TASK_TABLE_ERROR_TEST_ID))
      .toBeVisible();

    expect(page.getByTestId(TASK_TABLE_ERROR_TEST_ID).element()).toHaveTextContent(
      TASK_TABLE_WITH_DATA_ERROR_MESSAGE,
    );
  });

  it('renders an empty table when the API returns no tasks', async () => {
    worker.use(http.get('/api/tasks', () => HttpResponse.json([])));

    await render(<TaskTableWithData />);

    await expect
      .poll(() => page.getByTestId(TEST_IDS.TASKS_TABLE))
      .toBeInTheDocument();
  });
});

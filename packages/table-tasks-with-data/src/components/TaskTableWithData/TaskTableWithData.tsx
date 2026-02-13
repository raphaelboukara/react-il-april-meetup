import { useState, useEffect } from 'react';
import { TaskTable, type Task } from '@demo/table-tasks';
import { getTasks } from '../../getTasks';

export type { Task };

/** `data-testid` on the loading placeholder (no props — ids are fixed). */
export const TASK_TABLE_LOADING_TEST_ID = 'task-table-with-data-loading';

/** `data-testid` on the error message container when the request fails. */
export const TASK_TABLE_ERROR_TEST_ID = 'task-table-with-data-error';

/** User-visible copy when the tasks request fails (non-OK status or network error). */
export const TASK_TABLE_WITH_DATA_ERROR_MESSAGE = 'Failed to load tasks';

export const TaskTableWithData = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true); setError(null);
    getTasks()
      .then((data) => {
        setTasks(data); setLoading(false);
      })
      .catch(() => {
        setError(TASK_TABLE_WITH_DATA_ERROR_MESSAGE); setLoading(false);
      });
  }, []);

  if (loading) {
    return <div data-testid={TASK_TABLE_LOADING_TEST_ID}>Loading...</div>;
  }

  if (error) {
    return <div data-testid={TASK_TABLE_ERROR_TEST_ID} role="alert">{error}</div>;
  }

  return <TaskTable tasks={tasks} />;
};

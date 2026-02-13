export const TEST_IDS = {
  TASKS_TABLE: 'tasks-table',

  PROGRESS_TASK_TABLE: (taskId: string) =>
    `${TEST_IDS.TASKS_TABLE}-progress-${taskId}`,
};

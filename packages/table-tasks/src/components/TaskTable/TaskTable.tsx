import { useState } from 'react';
import { ProgressBar } from '@demo/progress-with-hover-and-reset';
import { TEST_IDS } from './TaskTable.testIds';

export interface Task {
  id: string;
  name: string;
  progress: number;
}

export interface TaskTableProps {
  tasks: Task[];
}

export const TaskTable = ({ tasks }: TaskTableProps) => {
  const [taskState, setTaskState] = useState(tasks);

  const handleReset = (taskId: string) => {
    setTaskState((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, progress: 0 } : t))
    );
  };

  return (
    <table data-testid={TEST_IDS.TASKS_TABLE} style={{ borderCollapse: 'collapse', width: '400px', fontFamily: 'sans-serif' }}>
      <thead>
        <tr>
          <th style={{ textAlign: 'left', padding: '8px' }}>Task</th>
          <th style={{ textAlign: 'left', padding: '8px' }}>Progress</th>
        </tr>
      </thead>
      <tbody>
        {taskState.map((task) => (
          <tr key={task.id}>
            <td style={{ padding: '8px' }}>{task.name}</td>
            <td style={{ padding: '8px' }}>
              <ProgressBar
                value={task.progress}
                onReset={() => handleReset(task.id)}
                testId={TEST_IDS.PROGRESS_TASK_TABLE(task.id)}
              />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

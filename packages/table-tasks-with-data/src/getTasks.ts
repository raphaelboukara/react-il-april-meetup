import type { Task } from '@demo/table-tasks';

export const TASKS_API_URL = '/api/tasks';

export async function getTasks(): Promise<Task[]> {
  const res = await fetch(TASKS_API_URL);
  if (!res.ok) {
    throw new Error(String(res.status));
  }
  return res.json() as Promise<Task[]>;
}

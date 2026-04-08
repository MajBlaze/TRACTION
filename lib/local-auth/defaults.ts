import type { AppData } from './types';

export const defaultAppData = (): AppData => ({
  expenses: [],
  groups: [],
  tasks: [],
  budget: 5000,
});

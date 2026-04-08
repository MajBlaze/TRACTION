'use client';

import { useEffect, useState } from 'react';
import type { AppData, Expense, Group, Task } from '@/lib/local-auth/types';
import { defaultAppData } from '@/lib/local-auth/defaults';

type StoreState = AppData & {
  isLoaded: boolean;
};

const listeners = new Set<(state: StoreState) => void>();

let loadPromise: Promise<void> | null = null;
let memoryState: StoreState = {
  ...defaultAppData(),
  isLoaded: false,
};

function emitChange() {
  listeners.forEach(listener => listener(memoryState));
}

function setStoreState(nextState: StoreState) {
  memoryState = nextState;
  emitChange();
}

function getAppData(state: StoreState): AppData {
  return {
    expenses: state.expenses,
    groups: state.groups,
    tasks: state.tasks,
    budget: state.budget,
  };
}

async function persistAppData() {
  try {
    await fetch('/api/user-data', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        data: getAppData(memoryState),
      }),
    });
  } catch (error) {
    console.error('Failed to persist app data.', error);
  }
}

async function loadAppData() {
  if (!loadPromise) {
    loadPromise = (async () => {
      try {
        const response = await fetch('/api/user-data', {
          cache: 'no-store',
          credentials: 'include',
        });

        if (!response.ok) {
          setStoreState({
            ...defaultAppData(),
            isLoaded: true,
          });
          return;
        }

        const { data } = (await response.json()) as { data: AppData };

        setStoreState({
          ...data,
          isLoaded: true,
        });
      } catch (error) {
        console.error('Failed to load app data.', error);
        setStoreState({
          ...defaultAppData(),
          isLoaded: true,
        });
      } finally {
        loadPromise = null;
      }
    })();
  }

  return loadPromise;
}

function updateData(updater: (current: AppData) => AppData) {
  const nextData = updater(getAppData(memoryState));
  setStoreState({
    ...nextData,
    isLoaded: true,
  });
  void persistAppData();
}

export const useTractionStore = () => {
  const [state, setState] = useState(memoryState);

  useEffect(() => {
    listeners.add(setState);

    if (!memoryState.isLoaded) {
      void loadAppData();
    }

    const handleAuthChange = () => {
      setStoreState({
        ...defaultAppData(),
        isLoaded: false,
      });
      void loadAppData();
    };

    window.addEventListener('traction-auth-changed', handleAuthChange);

    return () => {
      listeners.delete(setState);
      window.removeEventListener('traction-auth-changed', handleAuthChange);
    };
  }, []);

  return {
    expenses: state.expenses,
    groups: state.groups,
    tasks: state.tasks,
    budget: state.budget,
    isLoaded: state.isLoaded,
    setBudget: (budget: number) => {
      updateData(current => ({ ...current, budget }));
    },
    addExpense: (expense: Omit<Expense, 'id'>) => {
      updateData(current => ({
        ...current,
        expenses: [...current.expenses, { ...expense, id: crypto.randomUUID() }],
      }));
    },
    removeExpense: (id: string) => {
      updateData(current => ({
        ...current,
        expenses: current.expenses.filter(expense => expense.id !== id),
      }));
    },
    addGroup: (name: string) => {
      const group: Group = {
        id: crypto.randomUUID(),
        name,
        code: Math.random().toString(36).substring(2, 8).toUpperCase(),
        members: ['You'],
      };

      updateData(current => ({
        ...current,
        groups: [...current.groups, group],
      }));

      return group;
    },
    joinGroup: (code: string) => {
      updateData(current => ({
        ...current,
        groups: current.groups.map(group => {
          if (group.code !== code) {
            return group;
          }

          if (group.members.includes('You')) {
            return group;
          }

          return { ...group, members: [...group.members, 'You'] };
        }),
      }));
    },
    addTask: (task: Omit<Task, 'id' | 'isCompleted'>) => {
      updateData(current => ({
        ...current,
        tasks: [...current.tasks, { ...task, id: crypto.randomUUID(), isCompleted: false }],
      }));
    },
    toggleTask: (id: string) => {
      updateData(current => ({
        ...current,
        tasks: current.tasks.map(task =>
          task.id === id ? { ...task, isCompleted: !task.isCompleted } : task
        ),
      }));
    },
    removeTask: (id: string) => {
      updateData(current => ({
        ...current,
        tasks: current.tasks.filter(task => task.id !== id),
      }));
    },
    resetData: () => {
      setStoreState({
        ...defaultAppData(),
        isLoaded: true,
      });
      void persistAppData();
    },
  };
};

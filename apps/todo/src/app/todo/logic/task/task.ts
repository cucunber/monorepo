import { immer } from 'zustand/middleware/immer';
import {
  batchable,
  createStoreHook,
  shareable,
} from '@org/zustand-toolkit';
import { createStore } from 'zustand';
import { taskEntityAdapter, TaskEntityAdapterTypes, TaskSchema } from './task.schema';
import { v4 as uuidv4 } from 'uuid';
import { persist } from 'zustand/middleware';

type TasksStore = TaskEntityAdapterTypes['state'];

export const tasksStore = createStore<TasksStore>()(
  persist(immer(batchable(shareable(() => taskEntityAdapter.getState()))), { name: 'tasks' })
);

export const useTasksStore = createStoreHook(tasksStore);

export const tasksActions = taskEntityAdapter.getActions(tasksStore.setState);
export const tasksSelectors = taskEntityAdapter.getSelectors(tasksStore.getState);

export type SimpleTask = Omit<TaskSchema, 'id'>;

export const addTask = (task: SimpleTask) => {
  tasksActions.addOne({ id: uuidv4(), ...task })
}
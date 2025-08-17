import { immer } from 'zustand/middleware/immer';
import { batchable, createStoreHook, shareable } from '@org/zustand-toolkit';
import { createStore } from 'zustand';
import {
  propertyTaskEntityAdapter,
  PropertyEntityAdapterTypes,
  PropertyTaskKey,
  PropertyTaskSchema,
} from './property-task.schema';
import { persist } from 'zustand/middleware';
import { TaskId } from '../task';

type PropertyTaskStore = PropertyEntityAdapterTypes['state'];

export const propertyTaskStore = createStore<PropertyTaskStore>()(
  persist(
    immer(batchable(shareable(() => propertyTaskEntityAdapter.getState()))),
    {
      name: 'property-task',
    }
  )
);

export const usePropertiesTaskStore = createStoreHook(propertyTaskStore);

export const propertyTaskActions = propertyTaskEntityAdapter.getActions(
  propertyTaskStore.setState
);
export const propertyTaskSelectors = propertyTaskEntityAdapter.getSelectors(
  propertyTaskStore.getState
);

export const selectIdsByTaskId =
  (taskId: TaskId) => (state: PropertyTaskStore) =>
    propertyTaskSelectors
      .selectIds(state)
      .filter((id) => id.endsWith(`-${taskId}`));

export const selectPropertyTasksById =
  (taskId: TaskId) => (state: PropertyTaskStore) => {
    const idsToSelect = selectIdsByTaskId(taskId)(state);
    const allEntities = propertyTaskSelectors.selectEntities(state);
    return {
      ids: idsToSelect,
      entities: idsToSelect.reduce((acc, id) => {
        acc[id] = allEntities[id]!;
        return acc;
      }, {} as Record<PropertyTaskKey, PropertyTaskSchema>),
    };
  };

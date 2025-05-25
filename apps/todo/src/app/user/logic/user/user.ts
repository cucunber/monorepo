import { immer } from 'zustand/middleware/immer';
import { batchable, shareable } from '@org/zustand-toolkit';
import { createStore } from 'zustand';
import { userEntityAdapter, UserEntityAdapterTypes } from './user.schema';

type TasksStore = UserEntityAdapterTypes['state'];

const userStore = createStore<TasksStore>()(
  immer(batchable(shareable(() => userEntityAdapter.getState())))
);

export const userActions = userEntityAdapter.getActions(userStore.setState);
export const userSelectors = userEntityAdapter.getSelectors(userStore.getState);

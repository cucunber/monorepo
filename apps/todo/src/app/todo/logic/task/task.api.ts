import { ResourceBuilder } from '@org/request';

const taskBaseApi = new ResourceBuilder().setBaseURL('/task').build();

export const createTask = taskBaseApi
  .fork()
  .setMethod('POST')
  .setURL('/create');

export const updateTask = taskBaseApi
  .fork()
  .setMethod('PATCH')
  .setURL('/:task-id');

export const deleteTask = taskBaseApi
  .fork()
  .setMethod('DELETE')
  .setURL('/:task-id');

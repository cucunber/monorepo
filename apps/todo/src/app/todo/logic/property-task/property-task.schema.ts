import {
  createEntityAdapter,
  CreateEntityAdapterTypes,
} from '@org/zustand-toolkit';
import { z } from 'zod';
import { PropertyId } from '../property/property';
import { TaskId } from '../task';

export const propertyTaskSchema = z.object({
  propertyId: z.string().uuid(),
  taskId: z.string().uuid(),
  value: z.any(),
});

export type PropertyTaskSchema = z.infer<typeof propertyTaskSchema>;

export type PropertyTaskKey =
  `${PropertyTaskSchema['propertyId']}-${PropertyTaskSchema['taskId']}`;

export const propertyTaskEntityAdapter = createEntityAdapter<
  PropertyTaskSchema,
  PropertyTaskKey
>({
  idSelector: (model) => getPropertyTaskKey(model.propertyId, model.taskId),
});

export const getPropertyTaskKey = (propertyId: PropertyId, taskId: TaskId) =>
  `${propertyId}-${taskId}` as PropertyTaskKey;

export type PropertyEntityAdapterTypes = CreateEntityAdapterTypes<
  typeof propertyTaskEntityAdapter
>;

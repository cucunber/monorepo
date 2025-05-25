import { createEntityAdapter, CreateEntityAdapterTypes } from '@org/zustand-toolkit';
import { z } from 'zod';

export const taskDTOSchema = z.object({
  id: z.string(),
  title: z.string(),
});

export type TaskDTOSchema = z.infer<typeof taskDTOSchema>;

export const taskSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  description: z.string(),
});

export type TaskSchema = z.infer<typeof taskSchema>;

export const taskEntityAdapter = createEntityAdapter<
  TaskSchema,
  TaskSchema['id']
>({
  idSelector: (model) => model.id,
});

export type TaskEntityAdapterTypes = CreateEntityAdapterTypes<
  typeof taskEntityAdapter
>;

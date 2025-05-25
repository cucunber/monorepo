import {
  createEntityAdapter,
  CreateEntityAdapterTypes,
} from '@org/zustand-toolkit';
import { z } from 'zod';

export const userDTOSchema = z.object({
  id: z.string(),
  name: z.string(),
});

export type UserDTOSchema = z.infer<typeof userDTOSchema>;

export const userSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
});

export type UserSchema = z.infer<typeof userSchema>;

export const userEntityAdapter = createEntityAdapter<
  UserSchema,
  UserSchema['id']
>({
  idSelector: (model) => model.id,
});

export type UserEntityAdapterTypes = CreateEntityAdapterTypes<
  typeof userEntityAdapter
>;

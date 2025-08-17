import {
  createEntityAdapter,
  CreateEntityAdapterTypes,
} from '@org/zustand-toolkit';
import { z } from 'zod';

const numberType = z.object({
  type: z.literal('number'),
  min: z.number(),
  max: z.number(),
  unit: z.string(),
});

const stringType = z.object({
  type: z.literal('string'),
});

const boolType = z.object({
  type: z.literal('bool'),
});

const dateType = z.object({
  type: z.literal('date'),
  min: z.date(),
  max: z.date(),
});

const enumOption = z.object({
  id: z.string().uuid(),
  value: z.string(),
  title: z.string(),
});

export type PropertyOption = z.infer<typeof enumOption>;

const enumType = z.object({
  type: z.literal('enum'),
  options: z.array(enumOption),
  multiple: z.boolean(),
});

export const propertyDTOSchema = z.object({
  id: z.string(),
  type: z.discriminatedUnion('type', [
    enumType,
    numberType,
    stringType,
    boolType,
    dateType,
  ]),
});

export type PropertyDTOSchema = z.infer<typeof propertyDTOSchema>;

export const propertySchema = z.object({
  id: z.string().uuid(),
  type: z.discriminatedUnion('type', [
    enumType,
    numberType,
    stringType,
    boolType,
    dateType,
  ]),
  name: z.string(),
  description: z.string().nullable(),
  label: z.string().nullable(),
});

export type PropertySchema = z.infer<typeof propertySchema>;

export const propertyEntityAdapter = createEntityAdapter<
  PropertySchema,
  PropertySchema['id']
>({
  idSelector: (model) => model.id,
});

export type PropertyEntityAdapterTypes = CreateEntityAdapterTypes<
  typeof propertyEntityAdapter
>;

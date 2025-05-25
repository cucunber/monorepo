import { z } from "zod";

const propertyMetaDTOSchema = z.object({
    
})

export const propertyDTOSchema = z.object({
  id: z.string(),
  type: z.number(),
  value: z.string(),
});

export type PropertyDTOSchema = z.infer<typeof propertyDTOSchema>;

export const propertySchema = z.object({
  id: z.string().uuid(),
  type: z.number(),
  value: z.string(),
});

export type TaskSchema = z.infer<typeof propertySchema>;
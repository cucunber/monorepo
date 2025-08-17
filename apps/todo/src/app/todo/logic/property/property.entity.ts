import { PropertyDTOSchema, PropertySchema, propertySchema } from "./property.schema";

export const createPropertyEntity = (dto: PropertyDTOSchema): PropertySchema => {
    return propertySchema.parse(dto);
}
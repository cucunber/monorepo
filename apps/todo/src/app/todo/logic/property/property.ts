import { immer } from 'zustand/middleware/immer';
import { batchable, createStoreHook, shareable } from '@org/zustand-toolkit';
import { createStore } from 'zustand';
import {
  propertyEntityAdapter,
  PropertyEntityAdapterTypes,
  PropertySchema,
} from './property.schema';
import { v4 as uuidv4 } from 'uuid';
import { persist } from 'zustand/middleware';
import { Prettify } from '@org/ts-utils';

type PropertyStore = PropertyEntityAdapterTypes['state'];

export const propertyStore = createStore<PropertyStore>()(
  persist(immer(batchable(shareable(() => propertyEntityAdapter.getState()))), {
    name: 'property',
  })
);

export const usePropertiesStore = createStoreHook(propertyStore);

export const propertyActions = propertyEntityAdapter.getActions(
  propertyStore.setState
);
export const propertySelectors = propertyEntityAdapter.getSelectors(
  propertyStore.getState
);

export type SimpleProperty = Omit<PropertySchema, 'id'>;
export type PropertyId = PropertySchema['id'];

export type PickPropertyMeta<T extends SimpleProperty['type']['type']> =
  Prettify<
    Extract<SimpleProperty['type'], { type: T }> & Omit<SimpleProperty, 'type'>
  >;

export const addProperty = (property: SimpleProperty) => {
  propertyActions.addOne({ id: uuidv4(), ...property });
};

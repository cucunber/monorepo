import {
  actionsFactory,
  defaultIdSelector,
  selectorsFactory,
  stateFactory,
} from './entityAdapter.factory'
import {
  Comparer,
  EntityId,
  EntityState,
  GetState,
  IdSelector,
  SetState,
} from './entityAdapter.type'

interface EntityCreatorsProps<Entity extends object, Id extends EntityId> {
  idSelector?: IdSelector<Entity, Id>
  sort?: Comparer<Entity>
  initialState?: Array<Entity>
}

export function createEntityAdapter<
  Entity extends object,
  Id extends EntityId,
>({ idSelector = defaultIdSelector, sort, initialState }: EntityCreatorsProps<Entity, Id>) {
  let computedInitialState: EntityState<Entity, Id>;

  if(initialState){
    computedInitialState = initialState.reduce((acc, entity) => {
      const entityId = idSelector(entity);
      acc.ids.push(entityId);
      acc.entities[entityId] = entity;
      return acc
    }, { ids: [], entities: {} } as EntityState<Entity, Id>)
  }

  return {
    getState() {
      return stateFactory<Entity, Id>(computedInitialState)
    },
    getActions(setState: SetState<Entity, Id>) {
      return actionsFactory({ setState, idSelector, sort })
    },
    getSelectors(getState: GetState<Entity, Id>) {
      return selectorsFactory<Entity, Id>({ getState })
    },
    idSelector
  }
}

export type CreateEntityAdapterTypes<
  T extends Omit<ReturnType<typeof createEntityAdapter>, 'idSelector'>
> = {
  state: ReturnType<T['getState']>
  actions: ReturnType<T['getActions']>
  selectors: ReturnType<T['getSelectors']>
}

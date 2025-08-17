import { UseBoundStore, StoreApi } from 'zustand'

export type EntityId = string | number

export type DeepPartial<T> = T extends object ? {[K in keyof T]?: DeepPartial<T[K]>} : T;

export interface Update<Entity, Id extends EntityId> {
  id: Id
  update: DeepPartial<Entity>
}

export interface EntityState<Entity, Id extends EntityId> {
  ids: Array<Id>
  entities: Dictionary<Entity, Id>
}

export interface EntityActions<Entity, Id extends EntityId> {
  addOne(entity: Entity): void
  addMany(entities: Array<Entity>): void
  setOne(entity: Entity): void
  setMany(entities: Array<Entity>): void
  updateOne(id: Id, update: DeepPartial<Entity>): void
  updateMany(updates: Array<Update<Entity, Id>>): void
  upsertOne(entity: Entity): void
  upsertMany(entities: Array<Entity>): void
  removeMany(entities: Array<Entity>): void
  removeOne(entity: Entity): void
  setAll(entities: Array<Entity>): void
  removeAll(): void
}

type Dictionary<Entity, Id extends EntityId> = Partial<Record<Id, Entity>>

export interface EntitySelectors<
  Entity,
  Id extends EntityId,
  State extends EntityState<Entity, Id> = EntityState<Entity, Id>,
> {
  selectIds(state: State): Id[]
  selectEntities(state: State): Dictionary<Entity, Id>
  selectAll(state: State): Entity[]
  selectTotal(state: State): number
  selectById(state: State, id: Id): Entity | undefined
  boundedSelectIds(): Id[]
  boundedSelectEntities(): Dictionary<Entity, Id>
  boundedSelectAll(): Entity[]
  boundedSelectTotal(): number
  boundedSelectById(id: Id): Entity | undefined
}

export type UseBoundEntityStore<Entity, Id extends EntityId> = BoundEntityStore<
  Entity,
  Id
> & {
  actions: EntityActions<Entity, Id>
  selectors: EntitySelectors<Entity, Id>
}

export type BoundEntityStore<Entity, Id extends EntityId> = UseBoundStore<
  StoreApi<EntityState<Entity, Id>>
>

export type SetState<Entity, Id extends EntityId> = BoundEntityStore<
  Entity,
  Id
>['setState']

export type GetState<Entity, Id extends EntityId> = BoundEntityStore<
  Entity,
  Id
>['getState']

export type Comparer<Entity> = (a: Entity, b: Entity) => number

export type IdSelector<Entity, Id extends EntityId> = (model: Entity) => Id

import merge from 'lodash.merge';

import {
	Comparer,
	DeepPartial,
	EntityActions,
	EntityId,
	EntitySelectors,
	EntityState,
	GetState,
	IdSelector,
	SetState
} from './entityAdapter.type';

const EMPTY_ENTITY_STATE = { ids: [], entities: {} };

export function stateFactory<Entity, Id extends EntityId>(
	initialState: EntityState<Entity, Id> = EMPTY_ENTITY_STATE
): EntityState<Entity, Id> {
	return { ...initialState };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function defaultIdSelector<Id extends EntityId>(entity: any): Id {
	return entity.id;
}

interface ActionsFactoryProps<Entity extends object, Id extends EntityId> {
	idSelector?: IdSelector<Entity, Id>;
	sort?: Comparer<Entity> | false;
	setState: SetState<Entity, Id>;
}

interface SelectorsFactoryProps<Entity extends object, Id extends EntityId> {
	getState: GetState<Entity, Id>;
}

export function actionsFactory<Entity extends object, Id extends EntityId>({
	setState,
	sort,
	idSelector = defaultIdSelector
}: ActionsFactoryProps<Entity, Id>): EntityActions<Entity, Id> {
	type State = EntityState<Entity, Id>;

	function getSortedIds<Entity, Id extends EntityId>(
		entities: EntityState<Entity, Id>['entities'],
		idSelector: IdSelector<Entity, Id>,
		sorter: Comparer<Entity>
	): Id[] {
		const entitiesList: Entity[] = Object.values(entities);

		entitiesList.sort(sorter);

		const sortedIds = entitiesList.map(idSelector);

		return sortedIds;
	}

	const setOne = (state: State, entity: Entity): State => {
		const id = idSelector(entity);

		const entities = {
			...state.entities,
			[id]: entity
		};

		const ids = sort ? getSortedIds(entities, idSelector, sort) : [...state.ids, id];

		return {
			entities,
			ids
		};
	};

	const addOne = (state: State, entity: Entity): State => {
		const id = idSelector(entity);

		if (state.entities[id]) {
			return state;
		}

		return setOne(state, entity);
	};

	const updateOne = (state: State, id: Id, update: DeepPartial<Entity>): State => {
		const entity = state.entities[id];

		if (!entity) {
			return state;
		}

		const entities = {
			...state.entities,
			[id]: merge({}, entity, update)
		};

		const ids = state.ids;

		return {
			entities,
			ids
		};
	};

	const upsertOne = (state: State, entity: Entity): State => {
		const id = idSelector(entity);

		const currentEntity = state.entities?.[id];

		if (!currentEntity) {
			return setOne(state, entity);
		}

		return updateOne(state, id, entity as DeepPartial<Entity>);
	};

	const removeOne = (state: State, entity: Entity): State => {
		const id = idSelector(entity);

		const { [id]: deletedEntity, ...entities } = state.entities;

		const ids = state.ids.filter((v) => v !== id);

		return {
			entities,
			ids
		} as State;
	};

	return {
		removeAll() {
			setState({
				entities: {},
				ids: []
			});
		},
		addOne(entity) {
			setState((state) => addOne(state, entity));
		},
		addMany(entities) {
			setState((state) => entities.reduce(addOne, state));
		},
		setOne(entity) {
			setState((state) => setOne(state, entity));
		},
		setMany(entities) {
			setState((state) => entities.reduce(setOne, state));
		},
		setAll(entities) {
			setState(() => entities.reduce(setOne, EMPTY_ENTITY_STATE));
		},
		updateOne(id, entity) {
			setState((state) => updateOne(state, id, entity));
		},
		updateMany(entities) {
			setState((state) => entities.reduce((state, { id, update }) => updateOne(state, id, update), state));
		},
		upsertOne(entity) {
			setState((state) => upsertOne(state, entity));
		},
		upsertMany(entities) {
			setState((state) => entities.reduce(upsertOne, state));
		},
		removeOne(entity) {
			setState((state) => removeOne(state, entity));
		},
		removeMany(entities) {
			setState((state) => entities.reduce(removeOne, state));
		}
	};
}

export function selectorsFactory<Entity extends object, Id extends EntityId>({
	getState
}: SelectorsFactoryProps<Entity, Id>): EntitySelectors<Entity, Id> {
	type State = EntityState<Entity, Id>;

	const selectIds = (state: State) => state.ids;
	const selectEntities = (state: State) => state.entities;

	const selectAll = ({ entities, ids }: State) =>
		ids.reduce((all, id): Entity[] => {
			const entity = entities[id];
			if (entity) {
				all.push(entity);
			}
			return all;
		}, [] as Entity[]);
	const selectTotal = (state: State) => state.ids.length;

	const selectById = ({ entities }: State, id: Id) => entities[id];

	const boundedSelectIds = () => selectIds(getState());
	const boundedSelectEntities = () => selectEntities(getState());
	const boundedSelectAll = () => selectAll(getState());
	const boundedSelectTotal = () => selectTotal(getState());
	const boundedSelectById = (id: Id) => selectById(getState(), id);

	return {
		selectIds,
		selectEntities,
		selectAll,
		selectTotal,
		selectById,
		boundedSelectIds,
		boundedSelectEntities,
		boundedSelectAll,
		boundedSelectTotal,
		boundedSelectById
	};
}

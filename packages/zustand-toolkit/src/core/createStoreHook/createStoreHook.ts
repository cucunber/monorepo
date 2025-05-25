import { StoreApi } from 'zustand';
import { useStoreWithEqualityFn } from 'zustand/traditional';

type ExtractState<S> = S extends {
	getState: () => infer T;
}
	? T
	: never;

type ReadonlyStoreApi<T> = Pick<StoreApi<T>, 'getState' | 'getInitialState' | 'subscribe'>;

export const createStoreHook =
	<S extends ReadonlyStoreApi<unknown>>(api: S) =>
	<Selected = ExtractState<S>>(
		selector: (state: ExtractState<S>) => Selected = (s) => s as Selected,
		eqFn?: (a: Selected, b: Selected) => boolean
	) =>
		useStoreWithEqualityFn(api, selector, eqFn);

export const createStoreSelector =
	<S extends object>() =>
	<Selected>(selector: (state: S) => Selected) =>
		selector;

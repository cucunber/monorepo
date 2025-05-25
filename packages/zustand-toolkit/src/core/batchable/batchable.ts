import merge from 'lodash.merge';
import { isFunction } from '@org/is';
import {
  Mutate,
  StateCreator,
  StoreApi,
  StoreMutatorIdentifier,
} from 'zustand';

type BatchableMutatorIdentifier = 'batchable';

type BatchableMethod = (callback: () => Promise<void> | void) => Promise<void>;
type BatchOptions = { batch: BatchableMethod };

type WithBatchable<S> = S & BatchOptions;

declare module 'zustand' {
  interface StoreMutators<S, A> {
    batchable: WithBatchable<S>;
  }
}

export declare type ComputedState<S> = (state: S) => S;

interface BatchingData {
  count: number;
  pending: Record<string, unknown>;
}

let globalBatchStore: Set<
  StoreApi<any> & { __batchingData__?: BatchingData }
> | null = null;

export async function batch(
  callback: () => Promise<void> | void
): Promise<void> {
  globalBatchStore = new Set();
  try {
    await callback();
  } finally {
    globalBatchStore.forEach((store) => {
      const batchingData = (store as any).__batchingData as BatchingData;
      if (
        batchingData &&
        batchingData.count === 0 &&
        Object.keys(batchingData.pending).length > 0
      ) {
        store.setState(batchingData.pending);
        batchingData.pending = {};
      }
    });

    globalBatchStore === null;
  }
}

type Batchable = <
  S,
  Mps extends [StoreMutatorIdentifier, unknown][] = [],
  Mcs extends [StoreMutatorIdentifier, unknown][] = []
>(
  f: StateCreator<S, [...Mps, [BatchableMutatorIdentifier, BatchOptions]], Mcs>
) => StateCreator<S, Mps, [[BatchableMutatorIdentifier, BatchOptions], ...Mcs]>;

type BatchableImpl = <T, A>(
  f: StateCreator<T, [], []>
) => StateCreator<T, [], []>;

const batchableImpl: BatchableImpl = (creator) => {
  return (set, get, store) => {
    type T = ReturnType<typeof creator>;
    const batchingData: BatchingData = {
      count: 0,
      pending: {},
    };

    (store as any).__batchingData__ = batchingData;

    const originalSetState = store.setState;

    store.setState = (update, replace) => {
      if (globalBatchStore !== null) {
        globalBatchStore.add(store);
      }
      if (batchingData.count > 0) {
        let updateObj;
        if (isFunction(update)) {
          const merged = merge({}, get(), batchingData.pending);
          updateObj = update(merged);
        } else {
          updateObj = update;
        }
        batchingData.pending = merge({}, batchingData.pending, updateObj);
      } else {
        // @ts-expect-error replace is always write type (boolean)
        originalSetState(update, replace);
      }
    };

    const singleBatch = async (
      callback: () => Promise<void> | void
    ): Promise<void> => {
      batchingData.count++;
      try {
        await callback();
      } finally {
        batchingData.count--;
        if (
          batchingData.count === 0 &&
          globalBatchStore === null &&
          Object.keys(batchingData.pending).length > 0
        ) {
          // @ts-ignore
          originalSetState(batchingData.pending);
          batchingData.pending = {};
        }
      }
    };

    const _store = store as Mutate<
      StoreApi<T>,
      [[BatchableMutatorIdentifier, BatchOptions]]
    >;
    _store.batch = singleBatch;
    return creator(set, get, store);
  };
};

export const batchable = batchableImpl as unknown as Batchable;

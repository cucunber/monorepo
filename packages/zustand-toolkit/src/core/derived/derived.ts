import isEqual from 'lodash.isequal'
import { useStoreWithEqualityFn } from 'zustand/traditional'
import type { StoreApi } from 'zustand/vanilla'

type Getter<State> = {
  (): State | undefined
  <T>(store: StoreApi<T>): T
}

type DeriveFn<State> = (get: Getter<State>) => State
type Listener<State> = (invalidatedState: State, previousState: State) => void
type AnyStore = StoreApi<unknown>

export function derive<State>(deriveFn: DeriveFn<State>): StoreApi<State> {
  const listeners = new Set<Listener<State>>()
  const subscriptions = new Map<AnyStore, () => void>()

  let state: State | undefined
  let dependencies: Map<AnyStore, unknown> | undefined
  let isInvalidated = true

  const invalidate = () => {
    if (isInvalidated) {
      return
    }
    isInvalidated = true
    listeners.forEach((listener) => listener(state as State, state as State))
  }

  const getIsDepsChanged = () => {
    if (!dependencies) {
      return true
    }
    const deps = Array.from(dependencies)
    const isDepsChanged = deps.some(
      ([store, value]) => !isEqual(store.getState(), value)
    )
    return isDepsChanged
  }

  const getState = (): State => {
    if (!isInvalidated) {
      return state as State
    }
    if (getIsDepsChanged()) {
      const newDependencies = new Map<AnyStore, unknown>()
      const get = <T>(store?: StoreApi<T>) => {
        if (!store) {
          return state
        }
        const s = store.getState()
        newDependencies.set(store, s)
        return s
      }
      state = deriveFn(get as unknown as Getter<State>)
      dependencies = newDependencies
    }
    if (listeners.size) {
      const deps = new Set(dependencies!.keys())
      subscriptions.forEach((unsubscribe, store) => {
        if (deps.has(store)) {
          deps.delete(store)
        } else {
          unsubscribe()
          subscriptions.delete(store)
        }
      })
      deps.forEach((store) => {
        subscriptions.set(store, store.subscribe(invalidate))
      })
      isInvalidated = false
    }
    return state as State
  }
  const subscribe = (listener: Listener<State>): (() => void) => {
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
      if (!listeners.size) {
        subscriptions.forEach((unsubscribe) => unsubscribe())
        subscriptions.clear()
        isInvalidated = true
      }
    }
  }
  const store = {
    getState,
    subscribe,
    getInitialState: () => {
      throw new Error('getInitialState is not available in derived store')
    },
    setState: () => {
      throw new Error('setState is not available in derived store')
    },
    destroy: () => {
      throw new Error('destroy is not available in derived store')
    },
  }
  return store
}

export const createDerivedStore = <State>(store: StoreApi<State>) => {
  const useDerivedStore = <Selected = State>(
    selector: (store: State) => Selected = (store: State) =>
      store as unknown as Selected
  ) => useStoreWithEqualityFn(store, selector)
  useDerivedStore.getState = store.getState
  useDerivedStore.setState = store.setState
  useDerivedStore.getInitialState = store.getInitialState
  useDerivedStore.subscribe = store.subscribe
  return useDerivedStore
}

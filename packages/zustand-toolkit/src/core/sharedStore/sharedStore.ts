import { isFunction, isString, isTypedObject } from '@org/is';
import { StateCreator, StoreMutatorIdentifier } from 'zustand';

type ShareableMutatorIdentifier = 'shareable';

type WithShareable<S> = S;

declare module 'zustand' {
  interface StoreMutators<S, A> {
    shareable: WithShareable<S>;
  }
}

type Shareable = <
  S,
  Mps extends [StoreMutatorIdentifier, unknown][] = [],
  Mcs extends [StoreMutatorIdentifier, unknown][] = []
>(
  f: StateCreator<S, [...Mps, [ShareableMutatorIdentifier, unknown]], Mcs>,
  config?: Partial<ShareableConfig<S>>
) => StateCreator<S, Mps, [[ShareableMutatorIdentifier, unknown], ...Mcs]>;

type ShareableImpl = <T>(
  f: StateCreator<T, [], []>,
  config: Partial<ShareableConfig<T>>
) => StateCreator<T, [], []>;

export function isSupported() {
  return 'BroadcastChannel' in globalThis;
}

interface EventData {
  timestamp: number;
  state: string;
}

const BASE_CHANNEL_NAME = '__ZUSTAND_SHARABLE_STORE__';
let __channelNameCounter__ = 0;

const ALL_FIELDS_TO_SYNC = '*' as const;
const INITIAL_SYNC_EVENT = 'INITIAL_SYNC_EVENT' as const;

type ShareableConfig<S> = {
  serializer: (target: any) => string;
  deserializer: (target: string) => any;
  fieldsToSync: typeof ALL_FIELDS_TO_SYNC | Array<Paths<S>>;
};

const DEFAULT_CONFIG: ShareableConfig<any> = {
  serializer: JSON.stringify,
  deserializer: JSON.parse,
  fieldsToSync: '*',
};

const shareableImpl: ShareableImpl = (
  creator,
  config = DEFAULT_CONFIG as any
) => {
  const mergedConfig = { ...DEFAULT_CONFIG, ...config };
  return (set, get, store) => {
    if (!isSupported()) {
      return creator(set, get, store);
    }
    const channelName = `${BASE_CHANNEL_NAME}${__channelNameCounter__++}`;
    const channel = new BroadcastChannel(channelName);

    let externalUpdate = false;
    let timestamp = 0;

    const originalSetState = store.setState;

    const collectDataToSync = (state: object) => {
      if (mergedConfig.fieldsToSync === ALL_FIELDS_TO_SYNC) {
        return state;
      }
      return state;
    };

    channel.onmessage = (evt: MessageEvent<EventData>) => {
      if (isTypedObject<EventData>(evt.data)) {
        if (evt.data.timestamp <= timestamp) {
          return;
        }
        externalUpdate = true;
        timestamp = evt.data.timestamp;
        const dataToSet = collectDataToSync(
          mergedConfig.deserializer(evt.data.state)
        );
        originalSetState(dataToSet);
        return;
      }

      if (isString(evt.data)) {
        if (evt.data === INITIAL_SYNC_EVENT) {
          channel.postMessage({
            timestamp: timestamp,
            state: mergedConfig.serializer(collectDataToSync(get() as object)),
          });
        }
      }
    };

    store.setState = (update, replace) => {
      timestamp = Date.now();
      let updateObj;
      if (isFunction(update)) {
        updateObj = update(get());
      } else {
        updateObj = update;
      }
      channel.postMessage({
        timestamp: timestamp,
        state: mergedConfig.serializer(collectDataToSync(updateObj)),
      });
      // @ts-expect-error replace is always write type (boolean)
      originalSetState(update, replace);
    };

    return creator(set, get, store);
  };
};

export const shareable = shareableImpl as unknown as Shareable;

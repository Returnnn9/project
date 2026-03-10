import { useSyncExternalStore, useRef, useCallback } from "react";
import { useRootStore } from "./StoreProvider";

export { useRootStore };
export function useStoreData<TStore extends { subscribe: (l: () => void) => () => void }, TResult>(
 store: TStore,
 selector: (store: TStore) => TResult
): TResult {
 // Use a ref to keep track of the latest selector function.
 // This allows us to have a stable getSnapshot while still using the latest logic.
 const selectorRef = useRef(selector);
 selectorRef.current = selector;

 // Memoize getSnapshot so that it only changes if the store instance changes.
 const getSnapshot = useCallback(() => {
  return selectorRef.current(store);
 }, [store]);

 return useSyncExternalStore(
  store.subscribe,
  getSnapshot,
  getSnapshot
 );
}

export const useCartStore = () => {
 const { cartStore } = useRootStore();
 return cartStore;
};

export const useUserStore = () => {
 const { userStore } = useRootStore();
 return userStore;
};

export const useUIStore = () => {
 const { uiStore } = useRootStore();
 return uiStore;
};

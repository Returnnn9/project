import { useSyncExternalStore, useRef, useCallback } from "react";
import { useRootStore } from "./StoreProvider";

export { useRootStore };
export function useStoreData<TStore extends { subscribe: (l: () => void) => () => void }, TResult>(
 store: TStore,
 selector: (store: TStore) => TResult
): TResult {
 const selectorRef = useRef(selector);
 selectorRef.current = selector;
 
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

export const useProductStore = () => {
 const { productStore } = useRootStore();
 return productStore;
};

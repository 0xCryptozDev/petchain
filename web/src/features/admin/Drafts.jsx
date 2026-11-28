import { createContext, useContext } from "react";

export const DraftContext = createContext(null);
// Drafts stay in memory and are isolated by Wallet. Never persist evidence in browser storage.
export function useDraftState(key, initial) {
  const { store, setStore, scope } = useContext(DraftContext);
  const id = scope + ":" + key;
  const value = store[id] ?? initial;
  return [value, (next) => setStore((previous) => ({ ...previous,
    [id]: typeof next === "function" ? next(previous[id] ?? initial) : next,
  }))];
}

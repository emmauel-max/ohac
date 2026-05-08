import { useContext } from "react";
import { UnreadCountsContext } from "./UnreadCountsContext";

export function useUnreadCounts() {
  const ctx = useContext(UnreadCountsContext);
  if (!ctx) throw new Error("useUnreadCounts must be used within UnreadCountsProvider");
  return ctx;
}

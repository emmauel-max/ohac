import { createContext } from "react";

export interface UnreadCountsContextType {
  announcementCount: number;
  eventCount: number;
  chatCount: number;
  totalCount: number;
  markAnnouncementsRead: () => void;
  markEventsRead: () => void;
  markChatRead: () => void;
}

export const UnreadCountsContext = createContext<UnreadCountsContextType | null>(null);

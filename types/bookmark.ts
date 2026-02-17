export interface Bookmark {
  id: string;
  user_id: string;
  title: string;
  url: string;
  created_at: string;
}

export type NewBookmark = Pick<Bookmark, "title" | "url">;

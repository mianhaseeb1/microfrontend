export interface Bookmark {
  id: string;
  title: string;
  links: BookmarkLink[];
  comment: string;
  editMode?: boolean;
}

export interface BookmarkLink {
  url: string;
  link: string;
  image?: string;
}

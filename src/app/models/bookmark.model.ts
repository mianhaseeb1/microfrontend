export interface Bookmark {
  id: number;
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

export interface BookmarkDTO {
  id?: number;
  pageId?: number;
  title: string;
  links: BookmarkLinkDTO[];
  comment: string;
  editMode?: boolean;
}

export interface BookmarkLinkDTO {
  url: string;
  link: string;
}

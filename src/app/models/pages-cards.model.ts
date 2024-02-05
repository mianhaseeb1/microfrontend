export interface IPagesCards {
  status: string;
  message: string;
  data: PagesData[];
}

export interface PagesData {
  createdAt: string;
  updatedAt: string;
  deletedAt: string;
  version: number;
  id: number;
  title: string;
  userId: number;
}

export interface PostPages {
  title: string;
  userId: number;
}

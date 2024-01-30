export interface DraggableItem {
  id: string;
  type: 'bookmark' | 'note' | 'chat';
  data: any;
}

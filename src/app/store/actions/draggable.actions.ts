import { createAction, props } from '@ngrx/store';
import { DraggableItem } from '../../models/draggable-item.model';

export const loadDraggableItems = createAction('[Draggable] Load Items');
export const draggableItemsLoaded = createAction(
  '[Draggable] Items Loaded',
  props<{ items: DraggableItem[] }>()
);
export const updateDraggableItemsOrder = createAction(
  '[Draggable] Update Items Order',
  props<{ items: DraggableItem[] }>()
);

import { createReducer, on } from '@ngrx/store';
import * as DraggableActions from '../actions/draggable.actions';
import { DraggableItem } from '../../models/draggable-item.model';

export interface DraggableState {
  items: DraggableItem[];
}

export const initialState: DraggableState = {
  items: [],
};

export const draggableReducer = createReducer(
  initialState,
  on(DraggableActions.draggableItemsLoaded, (state, { items }) => ({
    ...state,
    items,
  })),
  on(DraggableActions.updateDraggableItemsOrder, (state, { items }) => ({
    ...state,
    items: items,
  }))
);

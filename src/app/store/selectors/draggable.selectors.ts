import { createSelector, createFeatureSelector } from '@ngrx/store';
import { DraggableState } from '../reducers/draggable.reducers';

export const selectDraggableState =
  createFeatureSelector<DraggableState>('draggable');

export const selectDraggableItems = createSelector(
  selectDraggableState,
  (state: DraggableState) => state.items
);

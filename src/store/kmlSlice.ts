import { createSlice } from '@reduxjs/toolkit';
import { RootState } from './store';

export interface KmlState {
  tags: string[],
}

// Initial state
export const initialState: KmlState = {
  tags: [],
};

// Actual Slice
export const kmlSlice = createSlice({
  name: 'kml',
  initialState,
  reducers: {
    setKmlState(state: KmlState, action: { payload: string[] }) {
      state.tags = action.payload
    },
  }
});

export const { setKmlState } = kmlSlice.actions;

export const selectKmlState: any = (state: RootState) => state.kml.tags;

export default kmlSlice.reducer;
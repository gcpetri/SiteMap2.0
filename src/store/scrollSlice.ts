import { createSlice } from '@reduxjs/toolkit';
import { RootState } from './store';

export type ScrollState = {
  page: 'settings'|'preview'|'scraper'|'results'
}

// Initial state
export const initialState: ScrollState = {
  page: 'settings'
}

// Actual Slice
export const scrollSlice = createSlice({
  name: 'scroll',
  initialState,
  reducers: {
    setScrollState(state: ScrollState, action: { payload: string }) {
      state.page = action.payload as 'settings'|'preview'|'scraper'|'results'
    }
  }
})

export const { setScrollState } = scrollSlice.actions

export const selectScrollState: any = (state: RootState) => state.scroll.page

export default scrollSlice.reducer
import { createSlice } from '@reduxjs/toolkit';
import { RootState } from './store';

export interface NotifState {
  title: string,
  description?: string,
  type: 'error'|'info'|'loading'
}

// Initial state
export const initialState: NotifState = {
  title: '',
  type: 'info',
};

// Actual Slice
export const notifSlice = createSlice({
  name: 'notif',
  initialState,
  reducers: {
    setNotifState(state: NotifState, action: { payload: NotifState }) {
      state.title = action.payload.title,
      state.description = action.payload.description,
      state.type = action.payload.type
    },
  }
});

export const { setNotifState } = notifSlice.actions;

export const selectNotifState: any = (state: RootState) => state.notif;

export default notifSlice.reducer;
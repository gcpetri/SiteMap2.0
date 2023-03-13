import { createSlice } from '@reduxjs/toolkit';
import { RootState } from './store';

export type SettingsValidState = {
  valid: boolean
}

// Initial state
export const initialState: SettingsValidState = {
  valid: false
}

// Actual Slice
export const settingsValidSlice = createSlice({
  name: 'settingsValid',
  initialState,
  reducers: {
    setSettingsValidState(state: SettingsValidState, action: { payload: boolean }) {
      state.valid = action.payload
    }
  }
});

export const { setSettingsValidState } = settingsValidSlice.actions

export const selectSettingsValidState: any = (state: RootState) => state.settingsValid.valid

export default settingsValidSlice.reducer
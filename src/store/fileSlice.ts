import { createSlice } from '@reduxjs/toolkit';
import { config } from '../utils/config';
import { RootState } from './store';

export type FileState = {
  files: { [f: string]: boolean },
}

// Initial state
export const initState = (): FileState => {
  const st: FileState = {
    files: {}
  }
  config.fileTypes.forEach(f => {
    st.files[f] = false
  })
  return st
}

export const initialState = initState()

// Actual Slice
export const fileSlice = createSlice({
  name: 'file',
  initialState,
  reducers: {
    setFileState(state: FileState, action: { payload: { [f: string]: boolean } }) {
      state.files = action.payload
    }
  }
});

export const { setFileState } = fileSlice.actions;

export const selectFileState: any = (state: RootState) => state.file.files;

export default fileSlice.reducer;
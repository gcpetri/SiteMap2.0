import { createSlice } from '@reduxjs/toolkit';
import { RootState } from './store';

export interface Regex {
  id: string,
  label: string,
  expression: string,
  operation: string,
}

// Type for our state
export interface RegexState {
  regex: Regex[],
}

// Initial state
export const initialState: RegexState = {
  regex: [],
}

// Actual Slice
export const regexSlice = createSlice({
  name: 'regex',
  initialState,
  reducers: {
    setRegexState(state: RegexState, action: { payload: Regex[] }) {
      state.regex = action.payload
    },
    updateRegexState(state: RegexState, action: { payload: { updated: Regex, oldExpression: string } }) {
      const existingRegexIndex = state.regex.findIndex(r => r.expression === action.payload.oldExpression);
      const updatedRegex = {
        ...state.regex[existingRegexIndex],
        expression: action.payload.updated.expression,
        label: action.payload.updated.label,
      }
      const existingRegex = state.regex
      existingRegex[existingRegexIndex] = updatedRegex
      state.regex = existingRegex
    }
  }
});

export const { setRegexState } = regexSlice.actions

export const { updateRegexState } = regexSlice.actions

export const selectRegexState: any = (state: RootState) => state.regex.regex

export default regexSlice.reducer
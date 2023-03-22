import { configureStore } from "@reduxjs/toolkit";
import { regexSlice } from "./regexSlice";
import { kmlSlice } from "./kmlSlice";
import { fileSlice } from "./fileSlice";
import { scrollSlice } from "./scrollSlice";
import { settingsValidSlice } from "./settingsValidSlice";
import { notifSlice } from "./notifSlice";

export const store = configureStore({
  reducer: {
    [regexSlice.name]: regexSlice.reducer,
    [kmlSlice.name]: kmlSlice.reducer,
    [fileSlice.name]: fileSlice.reducer,
    [scrollSlice.name]: scrollSlice.reducer,
    [settingsValidSlice.name]: settingsValidSlice.reducer,
    [notifSlice.name]: notifSlice.reducer,
  },
  devTools: true,
});

export type RootState = ReturnType<typeof store.getState>

export type AppDispatch = typeof store.dispatch
import { create } from 'zustand'
import { createAuthSlice } from './authSlice'
import { createUISlice } from './uiSlice'
import { createClientSlice } from './clientSlice'
import { createEmailSlice } from './emailSlice'
import { createUserSlice } from './userSlice'
import { createEventSlice } from './eventSlice'

export const useStore = create((set, get) => ({
  ...createAuthSlice(set, get),
  ...createUISlice(set, get),
  ...createClientSlice(set, get),
  ...createEmailSlice(set, get),
  ...createUserSlice(set, get),
  ...createEventSlice(set, get)
}));

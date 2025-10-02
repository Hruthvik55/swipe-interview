import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  candidate: null,
  candidates: [],
}

const sessionSlice = createSlice({
  name: 'session',
  initialState,
  reducers: {
    setCandidate: (state, action) => {
      state.candidate = action.payload
    },
    addCandidate: (state, action) => {
      if (!state.candidates) state.candidates = []
      state.candidates.push(action.payload)
    },
    deleteCandidate: (state, action) => {
      const index = action.payload
      if (state.candidates && state.candidates.length > index) {
        state.candidates.splice(index, 1)
      }
    },
  },
})

export const { setCandidate, addCandidate, deleteCandidate } = sessionSlice.actions
export default sessionSlice.reducer

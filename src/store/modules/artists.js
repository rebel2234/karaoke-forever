import {
  LIBRARY_PUSH,
} from 'constants/actions'

// ------------------------------------
// Action Handlers
// ------------------------------------
const ACTION_HANDLERS = {
  [LIBRARY_PUSH]: (state, { payload }) => ({
    ...state,
    result: payload.artists.result,
    entities: payload.artists.entities,
  }),
}

// ------------------------------------
// Reducer
// ------------------------------------
let initialState = {
  result: [],
  entities: {},
}

export default function artistsReducer (state = initialState, action) {
  const handler = ACTION_HANDLERS[action.type]

  return handler ? handler(state, action) : state
}

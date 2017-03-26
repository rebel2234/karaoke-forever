module.exports = {
  // authentication
  SOCKET_AUTH_ERROR: 'SOCKET_AUTH_ERROR',
  // library
  LIBRARY_UPDATE: 'library/FULL_UPDATE',
  ARTIST_UPDATE: 'library/ARTIST_UPDATE',
  SONG_UPDATE: 'library/SONG_UPDATE',
  LIBRARY_SEARCH: 'library/SEARCH',
  LIBRARY_SEARCH_RESET: 'library/SEARCH_RESET',
  // queue
  QUEUE_ADD: 'server/QUEUE_ADD',
  QUEUE_REMOVE: 'server/QUEUE_REMOVE',
  QUEUE_UPDATE: 'queue/QUEUE_UPDATE',
  QUEUE_END: 'queue/QUEUE_END',
  // player
  PLAYER_NEXT_REQUEST: 'server/PLAYER_NEXT',
  PLAYER_NEXT: 'player/PLAYER_NEXT',
  PLAYER_QUEUE_END: 'player/PLAYER_QUEUE_END',
  PLAYER_PLAY_REQUEST: 'server/PLAYER_PLAY',
  PLAYER_PLAY: 'player/PLAYER_PLAY',
  PLAYER_PAUSE_REQUEST: 'server/PLAYER_PAUSE',
  PLAYER_PAUSE: 'player/PLAYER_PAUSE',
  PLAYER_VOLUME_REQUEST: 'server/PLAYER_VOLUME',
  PLAYER_VOLUME: 'player/PLAYER_VOLUME',
  EMIT_STATUS: 'server/PLAYER_STATUS',
  EMIT_ERROR: 'server/PLAYER_ERROR',
  PLAYBACK_STATUS: 'status/PLAYBACK_STATUS',
  PLAYBACK_ERROR: 'status/PLAYBACK_ERROR',
  // user
  SET_PREFS: 'server/SET_PREFS',
  PREFS_CHANGE: 'user/PREFS_CHANGE',
  PROVIDER_REFRESH_REQUEST: 'server/PROVIDER_REFRESH',
  TOGGLE_SONG_STARRED: 'server/TOGGLE_SONG_STARRED',
  LOGIN: 'user/LOGIN',
  LOGOUT: 'user/LOGOUT',
  CREATE: 'user/CREATE',
  UPDATE: 'user/UPDATE',
  GET_ROOMS: 'user/GET_ROOMS',
  // misc
  _SUCCESS: '_SUCCESS',
  _ERROR: '_ERROR',
}

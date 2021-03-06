export default function createSocketMiddleware (socket, prefix) {
  return store => {
    // handler for incoming actions (sent from server)
    socket.on('action', action => {
      const { type } = action

      // can ignore player commands if we're not an active player
      if (type && type.startsWith('player/') && !store.getState().location.pathname.startsWith('/player')) {
        return
      }

      store.dispatch(action)
    })

    return next => action => {
      const { type } = action

      // only apply to socket.io requests
      if (!type || !type.startsWith(prefix)) {
        return next(action)
      }

      // fire request action
      next(action)

      // emit action along with ack callback (3rd arg)
      // that can optionally receive data when server
      // calls ctx.acknowledge(data)
      socket.emit('action', action, cbData => {
        if (typeof cbData === 'object' && typeof cbData.type !== 'undefined') {
          // assume it's an action
          next(cbData)
        }
      })
    }
  }
}

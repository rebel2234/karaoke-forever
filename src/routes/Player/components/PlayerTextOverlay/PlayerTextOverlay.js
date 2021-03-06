import PropTypes from 'prop-types'
import React from 'react'
import ColorCycle from './ColorCycle'
import UpNow from './UpNow'
import Fire from './Fire'
import './PlayerTextOverlay.css'

class PlayerTextOverlay extends React.Component {
  static propTypes = {
    queueItem: PropTypes.object.isRequired,
    isAtQueueEnd: PropTypes.bool.isRequired,
    isErrored: PropTypes.bool.isRequired,
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
  }

  render () {
    const { queueItem, width, height } = this.props
    let Component

    if (queueItem.queueId === -1) {
      Component = <ColorCycle text='PRESS PLAY TO BEGIN' />
    } else if (this.props.isAtQueueEnd) {
      Component = <ColorCycle text='CAN HAZ MOAR SONGZ?' />
    } else if (this.props.isErrored) {
      Component = <Fire text='CRAP' />
    } else {
      Component = <UpNow text={queueItem.userDisplayName} queueId={queueItem.queueId} />
    }

    return (
      <div style={{ width, height }} styleName='container'>
        {Component}
      </div>
    )
  }
}

export default PlayerTextOverlay

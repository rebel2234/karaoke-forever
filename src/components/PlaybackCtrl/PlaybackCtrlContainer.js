import { connect } from 'react-redux'
import PlaybackCtrl from './PlaybackCtrl'
import { requestPlay, requestPause, requestVolume, requestPlayNext } from 'store/modules/room'

//  Object of action creators (can also be function that returns object).
const mapActionCreators = {
  requestPlay,
  requestPlayNext,
  requestPause,
  requestVolume,
}

const mapStateToProps = (state) => {
  return {
    isPlaying: state.room.isPlaying,
    volume: state.room.volume,
  }
}

export default connect(mapStateToProps, mapActionCreators)(PlaybackCtrl)

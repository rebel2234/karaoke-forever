import { connect } from 'react-redux'
import Header from './Header'
import { setHeaderHeight } from 'store/modules/ui'

const mapActionCreators = {
  setHeaderHeight,
}

const mapStateToProps = (state) => {
  return {
    isAdmin: state.user.isAdmin,
    isPlayerPresent: state.room.isPlayerPresent,
  }
}

export default connect(mapStateToProps, mapActionCreators)(Header)
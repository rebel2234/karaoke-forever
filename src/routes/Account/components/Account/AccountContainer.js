import { connect } from 'react-redux'
import Account from './Account'
import { loginUser, logoutUser, createUser, updateUser } from 'store/modules/user'

const mapActionCreators = {
  loginUser,
  logoutUser,
  createUser,
  updateUser,
}

const mapStateToProps = (state) => {
  return {
    user: state.user,
    isLoggedIn: state.user.userId !== null,
    isFirstRun: state.prefs.isFirstRun === true,
  }
}

export default connect(mapStateToProps, mapActionCreators)(Account)

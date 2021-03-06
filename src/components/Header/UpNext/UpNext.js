import PropTypes from 'prop-types'
import React from 'react'
import secToTime from 'lib/secToTime'
import './UpNext.css'

const UpNext = props => {
  const { value, unit } = secToTime(props.wait)

  if (props.isUpNow) {
    return (
      <div styleName='upNow'>
        <p styleName='msg'>
          You&rsquo;re up!
        </p>
      </div>
    )
  }

  if (props.isUpNext) {
    return (
      <div styleName='upNext'>
        <p styleName='msg'>
          You&rsquo;re next in {value}{unit}...
        </p>
      </div>
    )
  }
}

UpNext.propTypes = {
  isUpNow: PropTypes.bool.isRequired,
  isUpNext: PropTypes.bool.isRequired,
  wait: PropTypes.number.isRequired,
}

export default UpNext

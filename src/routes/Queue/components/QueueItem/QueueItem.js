import React from 'react'
import classes from './QueueItem.css'

export const QueueItem = (props) => (
  <div className={classes.container}>
    <div className={classes.star}>
      <i className='material-icons md-48 md-dark md-inactive'>
        {props.isStarred ? 'star' : 'star_border'}
      </i>
    </div>

    <div className={classes.primary}>
      <div className={classes.title}>{props.title}</div>
      <div className={classes.artist}>{props.artist}</div>
      <div className={classes.user}>{props.userName}</div>
    </div>

    {props.canDelete &&
      <div onClick={props.onDeleteClick}>
        <i className={'material-icons '+classes.clear}>clear</i>
      </div>
    }
  </div>
)

QueueItem.propTypes = {
  title: React.PropTypes.string.isRequired,
  artist: React.PropTypes.string.isRequired,
  userName: React.PropTypes.string.isRequired,
  canDelete: React.PropTypes.bool.isRequired,
  onDeleteClick: React.PropTypes.func.isRequired,
}

export default QueueItem
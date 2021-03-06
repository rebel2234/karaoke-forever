import PropTypes from 'prop-types'
import React from 'react'
import PathItem from './PathItem'
import PathChooser from './PathChooser'
import Icon from 'components/Icon'
import './PathPrefs.css'
import HttpApi from 'lib/HttpApi'
const api = new HttpApi('prefs/path')

export default class PathPrefs extends React.Component {
  static propTypes = {
    paths: PropTypes.object.isRequired,
    // actions
    receivePrefs: PropTypes.func.isRequired,
    requestScan: PropTypes.func.isRequired,
  }

  state = {
    isExpanded: false,
    isChoosing: false,
  }

  toggleExpanded (e, name) {
    this.setState({ isExpanded: !this.state.isExpanded })
  }

  handleAddPath = (dir) => {
    api('POST', `/?dir=${encodeURIComponent(dir)}`)
      .then(res => {
        this.props.receivePrefs(res)
        this.setState({ isChoosing: false })
      }).catch(err => {
        alert(err)
      })
  }

  handleRemovePath = (pathId) => {
    const { path } = this.props.paths.entities[pathId]

    if (!confirm(`Remove folder from library?\n\n${path}`)) {
      return
    }

    api('DELETE', `/${pathId}`)
      .then(res => {
        this.props.receivePrefs(res)
      }).catch(err => {
        alert(err)
      })
  }

  handleOpenChooser = () => {
    this.setState({ isChoosing: true })
  }

  handleCloseChooser = () => {
    this.setState({ isChoosing: false })
  }

  handleRefresh = () => {
    this.props.requestScan()
  }

  render () {
    const { paths } = this.props
    const { isExpanded } = this.state

    return (
      <div styleName='container'>
        <div style={{ display: 'flex' }} onClick={() => this.toggleExpanded()}>
          <div styleName='title'>Media Folders</div>
          <div style={{ flex: 1, textAlign: 'right' }}>
            <div style={{ display: 'inline-block' }}>
              <Icon icon={isExpanded ? 'EXPAND_LESS' : 'EXPAND_MORE'} size={32} styleName='icon' />
            </div>
          </div>
        </div>

        <div styleName='content' style={{ display: isExpanded ? 'block' : 'none' }}>
          {paths.result.length === 0 &&
            <p style={{ marginTop: 0 }}>Add media folders to get started.</p>
          }

          {paths.result.map(id =>
            <PathItem
              key={id}
              path={paths.entities[id].path}
              onRemoveClick={() => this.handleRemovePath(id)}
              isRemovable
            />
          )}

          <div style={{ display: 'flex' }}>
            <button style={{ flex: 1, width: 'auto' }} onClick={this.handleOpenChooser}>Add Folder</button>
            {paths.result.length > 0 &&
              <button style={{ marginLeft: '.5em', width: 'auto' }} onClick={this.handleRefresh}>Refresh</button>
            }
          </div>

          <PathChooser
            isVisible={this.state.isChoosing}
            onCancel={this.handleCloseChooser}
            onChoose={this.handleAddPath}
          />
        </div>
      </div>
    )
  }
}

import React, {Component} from 'react';
import {Select} from '@buffetjs/core'
import _ from 'lodash'

class TargetFieldSelect extends Component {
  state = {
    selectedTarget: ''
  }

  componentDidMount() {
    const options = this.fillOptions()
    this.setState({selectedTarget: options && options[0]})
  }

  onChange(event) {
    const {onChange} = this.props
    const selectedTarget = event.target.value
    onChange(selectedTarget)
    this.setState({selectedTarget})
  }


  fillOptions() {
    const {targetModel} = this.props
    const options = targetModel &&
      /*deprecated => attributes is not an array anymore...*/
      // targetModel.attributes.map(attribute => {
      //   const type = attribute.params.type;
      //   return type && {label: attribute.name, value: attribute.name}
      // })
      _.keys(targetModel.attributes).map(attribute => {
        const type = targetModel.attributes[attribute].type
        return type && {label: attribute, value: attribute}
      })
    return [{label: 'None', value: 'none'}, ...options]
  }

  render() {

    return (
      <Select
        name={'targetField'}
        value={this.state.selectedTarget}
        options={this.fillOptions()}
        onChange={event => this.onChange(event)}
      />
    )
  }
}

export default TargetFieldSelect;

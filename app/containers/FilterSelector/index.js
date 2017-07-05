// Libraries
import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

// Components
import Title from './components/title';
import ValuesList from './components/valuesList';

class FilterSelector extends React.Component {
  constructor(props) {
    super();

    this.state = {
      deployed: false,
      selected: [],
      currentTitle: props.title,
    };
  }

  getTitle = (selection) => {
    let newTitle = '';

    if (!this.props.multiple && selection.length > 0) {
      newTitle = _.find(this.props.values, { value: selection[0] }).text;
    } else if (selection.length > 0) {
      newTitle = `${this.props.title} (${selection.length})`;
    } else {
      newTitle = this.props.title;
    }

    return newTitle;
  }

  toggleExpanded = () => {
    this.setState({ deployed: !this.state.deployed });
  }

  selectionChange = (value) => {
    let newSelection = _.clone(this.state.selected);

    if (!this.props.multiple) {
      newSelection = [value];
    } else if (_.includes(newSelection, value)) {
      newSelection = _.reject(newSelection, value);
    } else {
      newSelection = newSelection.push(value);
    }

    this.setState({ selected: newSelection, currentTitle: this.getTitle(newSelection) });
    this.props.onChange(newSelection);
  }

  render() {
    const { deployed, selected, currentTitle } = this.state;
    const { values } = this.props;

    return (
      <div tabIndex="0" role="listbox" aria-expanded={deployed} onChange={console.log}>
        <Title title={currentTitle} deployed={deployed} onClick={this.toggleExpanded} />
        {deployed && <ValuesList values={values} selected={selected} />}
      </div>
    );
  }
}

FilterSelector.propTypes = {
  title: PropTypes.string.required,
  values: PropTypes.arrayOf(
    PropTypes.shape({
      text: PropTypes.string,
      value: PropTypes.any,
    }).required
  ),
  onChange: PropTypes.func,
  multiple: PropTypes.bool,
};


export default FilterSelector;

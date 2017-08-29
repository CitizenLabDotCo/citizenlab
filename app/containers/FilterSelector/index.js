// Libraries
import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import styled from 'styled-components';

// Components
import Title from './components/title';
import ValuesList from './components/valuesList';
import clickOutside from 'utils/containers/clickOutside';

// Style
const Container = styled(clickOutside)`
  display: inline-block;
  position: relative;
  outline: none;

  & + & {
    margin-left: 2rem;
  }
`;

class FilterSelector extends React.Component {
  constructor() {
    super();

    this.baseID = `filter-${Math.floor(Math.random() * 10000000)}`;

    this.state = {
      deployed: false,
      currentTitle: '',
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({ currentTitle: this.getTitle(nextProps.selected) });
  }

  getTitle = (selection, values = this.props.values, multiple = this.props.multiple, title = this.props.title) => {
    let newTitle = '';

    if (!multiple && selection.length > 0) {
      newTitle = _.find(values, { value: selection[0] }).text;
    } else if (selection.length > 0) {
      newTitle = `${title} (${selection.length})`;
    } else {
      newTitle = title;
    }

    return newTitle;
  }

  toggleExpanded = () => {
    this.setState({ deployed: !this.state.deployed });
  }

  selectionChange = (value) => {
    let newSelection = _.clone(this.props.selected);

    if (!this.props.multiple) {
      newSelection = [value];
    } else if (_.includes(newSelection, value)) {
      newSelection = _.without(newSelection, value);
    } else {
      newSelection.push(value);
    }

    if (this.props.onChange) {
      this.props.onChange(this.props.name, newSelection);
    }
  }

  handleClickOutside = () => {
    if (this.state.deployed) {
      this.toggleExpanded();
    }
  }

  render() {
    const { deployed, currentTitle } = this.state;
    const { values, multiple, selected } = this.props;

    return (
      <Container tabIndex="0" onClickOutside={this.handleClickOutside}>
        <Title title={currentTitle} deployed={deployed} onClick={this.toggleExpanded} baseID={this.baseID} />
        <ValuesList deployed={deployed} values={values} selected={selected} onChange={this.selectionChange} multiple={multiple} baseID={this.baseID} />
      </Container>
    );
  }
}

FilterSelector.propTypes = {
  title: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  values: PropTypes.arrayOf(
    PropTypes.shape({
      text: PropTypes.string,
      value: PropTypes.any,
    })
  ),
  onChange: PropTypes.func,
  multiple: PropTypes.bool,
  selected: PropTypes.array,
};

export default FilterSelector;

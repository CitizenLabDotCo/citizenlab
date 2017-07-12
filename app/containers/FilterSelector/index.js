// Libraries
import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import styled from 'styled-components';

// Components
import Title from './components/title';
import ValuesList from './components/valuesList';

// Style
const Container = styled.div`
  display: inline-block;
  position: relative;
  outline: none;
`;

class FilterSelector extends React.Component {
  constructor(props) {
    super();

    this.baseID = `filter-${Math.floor(Math.random() * 10000000)}`;

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
      newSelection = _.without(newSelection, value);
    } else {
      newSelection.push(value);
    }

    this.setState({ selected: newSelection, currentTitle: this.getTitle(newSelection) });
    if (this.props.onChange) {
      this.props.onChange(newSelection);
    }
  }

  render() {
    const { deployed, selected, currentTitle } = this.state;
    const { values, multiple } = this.props;

    return (
      <Container tabIndex="0">
        <Title title={currentTitle} deployed={deployed} onClick={this.toggleExpanded} baseID={this.baseID} />
        <ValuesList deployed={deployed} values={values} selected={selected} onChange={this.selectionChange} multiple={multiple} baseID={this.baseID} />
      </Container>
    );
  }
}

FilterSelector.propTypes = {
  title: PropTypes.string.isRequired,
  values: PropTypes.arrayOf(
    PropTypes.shape({
      text: PropTypes.string,
      value: PropTypes.any,
    })
  ),
  onChange: PropTypes.func,
  multiple: PropTypes.bool,
};

export default FilterSelector;

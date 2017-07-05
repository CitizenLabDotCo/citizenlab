// Libraries
import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import styled from 'styled-components';

const StyledList = styled.div`
  border-radius: 5px;
  background-color: #ffffff;
  box-shadow: 0 0 15px 0 rgba(0, 0, 0, 0.1);
  border: solid 1px #eaeaea;
  max-height: 10em;
  overflow-y: auto;
  padding: 10px;
  position: absolute;
`;

const StyledOption = styled.option`
  padding: .8rem;

  :hover, :focus {
    background-color: #f9f9f9;
  }
`;

class ValuesList extends React.Component {
  isSelected(value) {
    return _.includes(this.props.selected, value);
  }

  render() {
    const { values, onChange } = this.props;

    return (
      <StyledList >
        {values && values.map((entry) => (
          <StyledOption role="option" key={entry.value} onSelect={onChange}>{entry.text}</StyledOption>
        ))}
      </StyledList>
    );
  }
}

ValuesList.propTypes = {
  values: PropTypes.arrayOf(
    PropTypes.shape({
      text: PropTypes.string,
      value: PropTypes.any,
    })
  ),
  onChange: PropTypes.func,
  selected: PropTypes.array,
};

export default ValuesList;

// Libraries
import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

// Components
import Icon from 'components/Icon';

// Style
const StyledTitle = styled.div`
  color: #6b6b6b;
  cursor: pointer;
  font-size: 1.25rem;
  position: relative;
  z-index: 15;

  svg {
    margin-left: .5em;
    transform: ${(props) => props.deployed ? 'rotate(180deg)' : 'rotate(0)'};
    transition: all .2s ease-in-out;
  }
`;

class Title extends React.Component {
  render() {
    const { title, onClick, deployed } = this.props;

    return (
      <StyledTitle onClick={onClick} deployed={deployed}>
        {title}

        <Icon name="dropdown" />
      </StyledTitle>
    );
  }
}

Title.propTypes = {
  title: PropTypes.string,
  deployed: PropTypes.bool,
  onClick: PropTypes.func,
};

export default Title;

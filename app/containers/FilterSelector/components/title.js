// Libraries
import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';


// Style
const StyledTitle = styled.div`
  color: #6b6b6b;
  font-size: 1.5rem;
`;

class Title extends React.Component {
  render() {
    const { title, onClick } = this.props;

    return (
      <StyledTitle onClick={onClick}>
        {title}
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

import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

const Container = styled.div`
  width: 100%;
  color: #333;
  font-size: 18px;
  font-weight: 600;
  padding: 20px;
  cursor: pointer;
  user-select: none;
  background: ${(props) => props.selected ? '#eee' : '#fff'};

  &:hover {
    background: #eee;
  }
`;

class IdeaTitle extends React.PureComponent {
  handleOnClick = () => {
    this.props.onClick(this.props.id);
  }

  render() {
    const { id, title, selected } = this.props;
    console.log(`Rendered IdeaTitle for idea ${id}`);
    return <Container onClick={this.handleOnClick} selected={selected}>{title}</Container>;
  }
}

IdeaTitle.propTypes = {
  id: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  selected: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired,
};

export default IdeaTitle;

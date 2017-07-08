import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import IdeaListService from '../services/ideaListService';

const Container = styled.div`
  width: 100%;
  color: #333;
  font-size: 20px;
  font-weight: 600;
  padding: 20px;
  cursor: pointer;
  background: ${(props) => props.selected ? '#e0e0e0' : 'white'};

  &:hover {
    background: ${(props) => props.selected ? '#ddd' : '#e0e0e0'};
  }
`;

class IdeaTitle extends React.PureComponent {
  handleOnClick = () => {
    const { observer, id } = this.props;
    IdeaListService.toggleIdea(observer, id);
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
  observer: PropTypes.object.isRequired,
};

export default IdeaTitle;

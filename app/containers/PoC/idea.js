import React from 'react';
import PropTypes from 'prop-types';
import IdeasStream from './ideasStream';
import styled from 'styled-components';

const StyledIdea = styled.div`
  color: ${(props) => props.selected ? 'white' : '#333'};
  font-size: 18px;
  padding: 10px;
  cursor: pointer;
  background: ${(props) => props.selected ? 'green' : 'white'};
`;

class Idea extends React.PureComponent {
  handleOnClick = (id) => () => {
    IdeasStream.select(id);
  }

  render() {
    const { idea } = this.props;
    console.log(`Rendered component ${idea.id}`);

    return (
      <div>
        { idea && <StyledIdea onClick={this.handleOnClick(idea.id)} selected={idea.selected}>{idea.id}</StyledIdea> }
      </div>
    );
  }
}

Idea.propTypes = {
  idea: PropTypes.object.isRequired,
};

export default Idea;

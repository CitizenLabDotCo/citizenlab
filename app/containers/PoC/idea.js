import React from 'react';
import PropTypes from 'prop-types';
import IdeasObserver from './ideasObserver';
import _ from 'lodash';
import Rx from 'rxjs/Rx';
import styled from 'styled-components';

const StyledIdea = styled.div`
  color: ${(props) => props.selected ? 'white' : '#333'};
  font-size: 18px;
  padding: 10px;
  cursor: pointer;
  background: ${(props) => props.selected ? 'green' : 'white'};
`;

class Idea extends React.PureComponent {
  constructor() {
    super();
    this.subscriptions = [];
    this.state = { idea: null };
  }

  componentDidMount() {
    this.subscriptions = [
      IdeasObserver.observe()
        .filter((ideas) => ideas)
        .switchMap((ideas) => Rx.Observable.from(ideas))
        .filter((idea) => idea.id === this.props.id)
        .distinctUntilChanged()
        .subscribe((idea) => {
          console.log(`Rendered component ${idea.id}`);
          this.setState({ idea });
        }),
    ];
  }

  componentWillUnmount() {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  handleOnClick = (id) => () => {
    IdeasObserver.select(id);
  }

  render() {
    const { idea } = this.state;

    return (
      <div>
        { idea && <StyledIdea onClick={this.handleOnClick(idea.id)} selected={idea.selected}>{idea.id}</StyledIdea> }
      </div>
    );
  }
}

Idea.propTypes = {
  id: PropTypes.string.isRequired,
};

export default Idea;

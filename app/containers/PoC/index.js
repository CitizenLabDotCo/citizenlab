import React from 'react';
import IdeasObserver from './ideasObserver';
import Idea from './idea';
import _ from 'lodash';

class Ideas extends React.PureComponent {
  constructor() {
    super();
    this.subscriptions = [];
    this.state = {
      loading: true,
      ideaIds: null,
    };
  }

  componentDidMount() {
    this.subscriptions = [
      IdeasObserver.observe()
        .filter((ideas) => _.isArray(ideas) && !_.isEmpty(ideas))
        .map((ideas) => ideas.map((idea) => idea.id))
        .subscribe((ideaIds) => {
          this.setState({
            loading: false,
            ideaIds,
          });
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
    const { loading, ideaIds } = this.state;

    return (
      <div>
        <h1>Ideas</h1>
        { loading && 'Loading...' }
        { ideaIds && ideaIds.map((ideaId) => <Idea key={ideaId} id={ideaId} />) }
      </div>
    );
  }
}

export default Ideas;

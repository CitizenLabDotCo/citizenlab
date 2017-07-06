import React from 'react';
import IdeasObserver from './ideasObserver';
import Idea from './idea';

class Ideas extends React.PureComponent {
  constructor() {
    super();
    this.subscriptions = [];
    this.state = { ideas: null };
  }

  componentDidMount() {
    this.subscriptions = [
      IdeasObserver.observe().subscribe((ideas) => {
        this.setState({ ideas });
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
    const { ideas } = this.state;

    return (
      <div>
        <h1>test</h1>
        {ideas && ideas.map((idea) => <Idea key={idea.id} id={idea.id} />)}
      </div>
    );
  }
}

export default Ideas;

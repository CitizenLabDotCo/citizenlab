import React from 'react';
import IdeasObserver from './ideasObserver';

class Idea extends React.PureComponent {
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
        <div>
          {ideas && ideas.map((idea) => (
            <div
              key={idea.id}
              onClick={this.handleOnClick(idea.id)}
              style={{ background: (idea.selected ? 'red' : 'white') }}
            >
              {idea.id}
            </div>
          ))}
        </div>
      </div>
    );
  }
}

export default Idea;

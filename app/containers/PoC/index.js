import React from 'react';
import IdeasStream from './ideasStream';
import Idea from './idea';

class Ideas extends React.PureComponent {
  constructor() {
    super();
    this.subscriptions = [];
    this.state = {
      loading: true,
      ideas: null,
    };
  }

  componentDidMount() {
    this.subscriptions = [
      IdeasStream.observe({
        sort: 'trending',
        'page[number]': 1,
        'page[size]': 5,
      }).filter((ideas) => ideas).subscribe((ideas) => {
        this.setState({
          loading: false,
          ideas,
        });
      }),
    ];
  }

  componentWillUnmount() {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  render() {
    const { loading, ideas } = this.state;

    return (
      <div>
        <h1>Ideas</h1>
        { loading && 'Loading...' }
        { ideas && ideas.map((idea) => <Idea key={idea.id} idea={idea} />) }
      </div>
    );
  }
}

export default Ideas;

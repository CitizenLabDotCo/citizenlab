import React from 'react';
import PropTypes from 'prop-types';
import IdeasObserver from './ideasObserver';
import _ from 'lodash';
import Rx from 'rxjs/Rx';

class Idea extends React.PureComponent {
  constructor() {
    super();
    this.subscriptions = [];
    this.state = { idea: null };
  }

  componentDidMount() {
    this.subscriptions = [
      IdeasObserver.observe()
        .filter((ideas) => _.isArray(ideas) && !_.isEmpty(ideas))
        .switchMap((ideas) => Rx.Observable.from(ideas))
        .filter((idea) => idea.id === this.props.id)
        .distinctUntilChanged()
        .subscribe((idea) => {
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
        { idea && <div onClick={this.handleOnClick(idea.id)} style={{ background: (idea.selected ? 'red' : 'white') }}>{idea.id}</div> }
      </div>
    );
  }
}

Idea.propTypes = {
  id: PropTypes.string.isRequired,
};

export default Idea;

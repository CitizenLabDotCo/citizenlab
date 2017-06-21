import React from 'react';
import PropTypes from 'prop-types';
import { createStructuredSelector } from 'reselect';


// components
import { Button, Icon, Form } from 'semantic-ui-react';
import FormComponent from 'components/forms/formComponent';

// import IdeaContent from '../IdeaContent';

// store
import { preprocess } from 'utils';
import { loadIdeaRequest } from '../../actions';
import { loadIdeaSagaFork, deleteIdeasVoteSagaFork, createIdeasVoteSagaFork } from 'resources/ideas/sagas';

class Votes extends FormComponent {
  constructor(props) {
    super();
    const { mode, voteId } = props;
    this.values = { votable_type: 'Idea', votable_id: props.ideaId, id: voteId, intMode: this.modeToInteger(mode) };
    this.state = { mode };
    this.saga = loadIdeaSagaFork;
  }

  modeToInteger = (mode) => ({ up: 1, down: -1 }[mode] || 0);
  integerToMode = (int) => ({ 1: 'up', '-1': 'down' }[int] || 'delete');

  handleVote = (modifier) => () => {
    const newIntMode = this.values.intMode + modifier;
    if (newIntMode <= 1 && newIntMode >= -1) {
      this.setState({ mode: this.integerToMode(this.values.intMode + modifier) }, () => {
        this.values.intMode = newIntMode;
      });
    }
  }

  handleSuccess = () => {
    const id = this.props.ideaId;
    this.props.loadIdea(id);
  }

  beforeSubmit = () => {
    const { ideaId, voteId } = this.props;
    this.values.mode = this.state.mode;
    if (this.values.intMode === 0) {
      this.values.id = voteId;
      this.saga = deleteIdeasVoteSagaFork;
    } else {
      this.values.id = ideaId;
      this.saga = createIdeasVoteSagaFork;
    }
  }

  render() {
    const { votesUp, votesDown, auth } = this.props;
    const { loading, mode } = this.props;
    const votes = votesUp - votesDown;
    return (
      <Form onSubmit={this.handleSubmit}>
        <Button.Group>
          <Button basic color="red" onClick={this.handleVote(-1)} disabled={!auth || loading || (mode === 'down')}>
            <Icon name="thumbs outline down" />
          </Button>
          <Button.Or text={votes} />
          <Button basic color="green" onClick={this.handleVote(+1)} disabled={!auth || loading || (mode === 'up')}>
            <Icon name="thumbs outline up" />
          </Button>
        </Button.Group>
      </Form>
    );
  }
}

Votes.propTypes = {
  count: PropTypes.number,
  upVote: PropTypes.func,
  downVote: PropTypes.func,
  children: PropTypes.any,
};


const mapStateToProps = createStructuredSelector({
  auth: (state) => state.getIn(['auth', 'id']),
  votesUp: (state, { ideaId }) => state.getIn(['resources', 'ideas', ideaId, 'attributes', 'upvotes_count']),
  votesDown: (state, { ideaId }) => state.getIn(['resources', 'ideas', ideaId, 'attributes', 'downvotes_count']),
  mode: (state, { voteId }) => state.getIn(['resources', 'votes', voteId, 'attributes', 'mode']),
  state: (state) => state,
});


export default preprocess(mapStateToProps, { loadIdea: loadIdeaRequest })(Votes);


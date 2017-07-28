import React from 'react';
import PropTypes from 'prop-types';
import { createStructuredSelector } from 'reselect';
import styled from 'styled-components';

// components
import FormComponent from 'components/forms/formComponent';
import { Form } from 'semantic-ui-react';
// import IdeaContent from '../IdeaContent';

// store
import { preprocess } from 'utils';
import { loadIdeaRequest } from '../../actions';
import { loadIdeaSagaFork, deleteIdeasVoteSagaFork, createIdeasVoteSagaFork } from 'resources/ideas/sagas';


const VotesContainer = styled.div`
  display: flex;
  justify-content: flex-start;
`;

const Vote = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;

  width: 100px;
  height: 57px;
  background-color: #f2f2f2;
  border-radius: 6px;

  &:not(:first-child) {
    margin-left: 8px;
  }
`;

const VoteUp = Vote.extend`
  &:hover svg {
    fill: #009900;
  }

  &:hover div {
    color: #009900;
  }

  & svg {
    fill: ${(props) => props.voted ? '#009900' : '#999'};
  }

  & div {
    color: ${(props) => props.voted ? '#009900' : '#999'};
  }
`;

const VoteDown = Vote.extend`
  &:hover svg {
    fill: #f30000;
  }

  &:hover div {
    color: #f30000;
  }
`;

const ThumbIcon = styled.svg`
  fill: #6b6b6b;
  height: 25px;
  cursor: pointer;
  margin: 0 5px;
  &:hover {
    fill: #000;
  }
`;

const VoteCount = styled.div`
  color: #6b6b6b;
  margin: 0 5px;
  font-weight: bold;
  font-size: 23px;
`;

const ThumbUpIcon = ThumbIcon.extend``;

const ThumbDownIcon = ThumbIcon.extend``;


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
  /* <Form onSubmit={this.handleSubmit}>
  <Button.Group>
    <Button basic color="red" onClick={this.handleVote(-1)} disabled={!auth || loading || (mode === 'down')}>
      <Icon name="thumbs outline down" />
    </Button>
    <Button.Or text={votes} />
    <Button basic color="green" onClick={this.handleVote(+1)} disabled={!auth || loading || (mode === 'up')}>
      <Icon name="thumbs outline up" />
    </Button>
  </Button.Group>
</Form>*/

  render() {
    // const { votesUp, votesDown, auth } = this.props;
    const { votesUp, votesDown } = this.props;
    const { mode } = this.props;
    return (
      <Form onSubmit={this.handleSubmit}>
        <VotesContainer>
          <VoteUp voted={mode === 'up'} onClick={this.handleVote(+1)}>
            <ThumbUpIcon height="100%" viewBox="0 0 24 24">
              <path d="M0 0h24v24H0z" fill="none" /><path d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-1.91l-.01-.01L23 10z" />
            </ThumbUpIcon>
            <VoteCount>{votesUp}</VoteCount>
          </VoteUp>
          <VoteDown voted={mode === 'down'} onClick={this.handleVote(-1)}>
            <ThumbDownIcon height="100%" viewBox="0 0 24 24">
              <path fill="none" d="M0 0h24v24H0V0z" /><path d="M15 3H6c-.83 0-1.54.5-1.84 1.22l-3.02 7.05c-.09.23-.14.47-.14.73v1.91l.01.01L1 14c0 1.1.9 2 2 2h6.31l-.95 4.57-.03.32c0 .41.17.79.44 1.06L9.83 23l6.59-6.59c.36-.36.58-.86.58-1.41V5c0-1.1-.9-2-2-2zm1 12c0 .268-.103.518-.287.703L9.827 21.59l-.35-.346c-.084-.086-.137-.2-.145-.32l.02-.205.938-4.517.25-1.203H3c-.535 0-.972-.422-1-.95l.002-.01.05-.493-.052-.05V12c0-.125.022-.24.06-.336l3.024-7.06C5.236 4.238 5.596 4 6 4h9c.552 0 1 .45 1 1v10zM19 3v12h4V3h-4zm3 11h-2V4h2v10z" />
            </ThumbDownIcon>
            <VoteCount>{votesDown}</VoteCount>
          </VoteDown>
        </VotesContainer>
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


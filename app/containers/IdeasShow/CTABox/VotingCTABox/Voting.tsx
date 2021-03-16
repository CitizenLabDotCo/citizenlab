import React, { PureComponent } from 'react';
import styled from 'styled-components';
import { adopt } from 'react-adopt';
import { isNilOrError } from 'utils/helperUtils';
import PopContainer from 'components/UI/PopContainer';
import VoteControl from 'components/VoteControl';
import VotingDisabled from 'components/VoteControl/VotingDisabled';
import GetIdea, { GetIdeaChildProps } from 'resources/GetIdea';

const Container = styled.div``;

interface InputProps {
  className?: string;
  ideaId?: string;
  projectId: string;
}

interface DataProps {
  idea: GetIdeaChildProps;
}

interface Props extends InputProps, DataProps {}

interface State {
  error: 'votingDisabled' | null;
}

class VoteWrapper extends PureComponent<Props, State> {
  constructor(props) {
    super(props);
    this.state = {
      error: null,
    };
  }

  componentDidUpdate(prevProps: Props) {
    const { idea } = this.props;
    const prevIdea = prevProps.idea;

    if (!isNilOrError(idea) && !isNilOrError(prevIdea)) {
      const votingEnabled =
        idea.attributes.action_descriptor.voting_idea.enabled;
      const prevVotingEnabled =
        prevIdea.attributes.action_descriptor.voting_idea.enabled;
      const votingDisabledReason =
        idea.attributes.action_descriptor.voting_idea.disabled_reason;
      const prevVotingDisabledReason =
        prevIdea.attributes.action_descriptor.voting_idea.disabled_reason;

      if (
        votingEnabled !== prevVotingEnabled ||
        votingDisabledReason !== prevVotingDisabledReason
      ) {
        this.setState({ error: null });
      }
    }
  }

  disabledVoteClick = () => {
    this.setState({ error: 'votingDisabled' });
  };

  render() {
    const { className, ideaId, projectId, idea } = this.props;
    const { error } = this.state;

    const votingDescriptor = isNilOrError(idea)
      ? null
      : idea.attributes.action_descriptor.voting_idea;

    if (!ideaId || !votingDescriptor) return null;

    return (
      <Container className={className}>
        {!error && (
          <VoteControl
            style="shadow"
            ideaId={ideaId}
            disabledVoteClick={this.disabledVoteClick}
            size="3"
          />
        )}
        {error === 'votingDisabled' && (
          <PopContainer icon="lock-outlined">
            <VotingDisabled
              votingDescriptor={votingDescriptor}
              projectId={projectId}
            />
          </PopContainer>
        )}
      </Container>
    );
  }
}

const Data = adopt<DataProps, InputProps>({
  idea: ({ ideaId, render }) => <GetIdea ideaId={ideaId}>{render}</GetIdea>,
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {(dataProps) => <VoteWrapper {...inputProps} {...dataProps} />}
  </Data>
);

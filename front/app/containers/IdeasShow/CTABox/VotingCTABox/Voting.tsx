import React, { PureComponent } from 'react';
import styled from 'styled-components';
import { adopt } from 'react-adopt';
import { isNilOrError } from 'utils/helperUtils';
import PopContainer from 'components/UI/PopContainer';
import VoteControl from 'components/VoteControl';
import VotingDisabled from 'components/VoteControl/VotingDisabled';
import GetIdea, { GetIdeaChildProps } from 'resources/GetIdea';

const Container = styled.div``;

const VoteControlWrapper = styled.div`
  &.error {
    display: none;
  }
`;

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
  isContainerVisible: boolean;
}

class VoteWrapper extends PureComponent<Props, State> {
  constructor(props) {
    super(props);
    this.state = {
      error: null,
      isContainerVisible: false,
    };
  }

  componentDidUpdate(prevProps: Props) {
    const { ideaId } = this.props;
    const prevIdeaId = prevProps.ideaId;

    if (ideaId !== prevIdeaId) {
      this.setState({ isContainerVisible: false, error: null });
    }
  }

  disabledVoteClick = () => {
    this.setState({ error: 'votingDisabled' });
  };

  setVoteControlRef = () => {
    // we check the ref returned by VoteControl to determine if the VoteControl component actually mounted
    // If it didn't mount (because showVoteContrle === false), we also shouldn't mount the Container in this component
    this.setState({ isContainerVisible: true });
  };

  render() {
    const { className, ideaId, projectId, idea } = this.props;
    const { isContainerVisible, error } = this.state;

    const votingDescriptor = isNilOrError(idea)
      ? null
      : idea.attributes.action_descriptor.voting_idea;

    if (!ideaId || !votingDescriptor) return null;

    const voteControlComponent = (
      <VoteControl
        styleType="shadow"
        ideaId={ideaId}
        disabledVoteClick={this.disabledVoteClick}
        setRef={this.setVoteControlRef}
        size="4"
      />
    );

    return !isContainerVisible ? (
      voteControlComponent
    ) : (
      <Container className={className || ''}>
        <VoteControlWrapper className={error ? 'error' : ''}>
          {voteControlComponent}
        </VoteControlWrapper>
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

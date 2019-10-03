import React, { PureComponent } from 'react';
import PopContainer from 'components/UI/PopContainer';
import VoteControl from 'components/VoteControl';
import VotingDisabled from 'components/VoteControl/VotingDisabled';
import Unauthenticated from './Unauthenticated';
import { IIdeaData } from 'services/ideas';

type Props = {
  ideaId?: string;
  votingDescriptor: IIdeaData['attributes']['action_descriptor']['voting'];
  projectId: string;
};

type State = {
  error: 'votingDisabled' | 'unauthenticated' | null;
};

class VoteWrapper extends PureComponent<Props, State> {
  constructor(props) {
    super(props);
    this.state = {
      error: null,
    };
  }

  unauthenticatedVoteClick = () => {
    this.setState({ error: 'unauthenticated' });
  }

  disabledVoteClick = () => {
    this.setState({ error: 'votingDisabled' });
  }

  render() {
    const { ideaId, projectId, votingDescriptor } = this.props;
    const { error } = this.state;

    if (!ideaId) return null;

    return (
      <div aria-live="polite">
        {!error &&
          <VoteControl
            ideaId={ideaId}
            unauthenticatedVoteClick={this.unauthenticatedVoteClick}
            disabledVoteClick={this.disabledVoteClick}
            size="3"
          />
        }
        {error === 'votingDisabled' &&
          <PopContainer icon="lock-outlined">
            <VotingDisabled
              votingDescriptor={votingDescriptor}
              projectId={projectId}
            />
          </PopContainer>
        }
        {error === 'unauthenticated' &&
          <PopContainer icon="lock-outlined">
            <Unauthenticated />
          </PopContainer>
        }
      </div>
    );
  }
}

export default VoteWrapper;

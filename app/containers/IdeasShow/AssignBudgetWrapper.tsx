import React, { PureComponent } from 'react';

// components
import VotingPopContainer from './VotingPopContainer';
import AssignBudgetControl from 'components/AssignBudgetControl';
// import AssignBudgetDisabled from 'components/AssignBudgetControl/AssignBudgetDisabled';
import Unauthenticated from './Unauthenticated';

interface Props {
  ideaId: string;
  participationContextId: string;
  participationContextType: 'Phase' | 'Project';
}

interface State {
  error: 'unauthenticated' | null;
}

class AssignBudgetWrapper extends PureComponent<Props, State> {
  constructor(props) {
    super(props);
    this.state = {
      error: null,
    };
  }

  unauthenticatedAssignBudgetClick = () => {
    this.setState({ error: 'unauthenticated' });
  }

  render() {
    const { ideaId, participationContextId, participationContextType } = this.props;
    const { error } = this.state;

    if (!error) {
      return (
        <AssignBudgetControl
          view="ideaPage"
          ideaId={ideaId}
          participationContextId={participationContextId}
          participationContextType={participationContextType}
          unauthenticatedAssignBudgetClick={this.unauthenticatedAssignBudgetClick}
        />
      );
    }

    if (error === 'unauthenticated') {
      return (
        <VotingPopContainer icon="lock-outlined">
          <Unauthenticated />
        </VotingPopContainer>
      );
    }

    return null;
  }
}

export default AssignBudgetWrapper;

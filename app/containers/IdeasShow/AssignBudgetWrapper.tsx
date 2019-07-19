import React, { PureComponent } from 'react';

// components
import VotingPopContainer from './VotingPopContainer';
import AssignBudgetControl from 'components/AssignBudgetControl';
import AssignBudgetDisabled from 'components/AssignBudgetControl/AssignBudgetDisabled';
import Unauthenticated from './Unauthenticated';

// services
import { IIdeaData } from 'services/ideas';

interface Props {
  ideaId: string;
  projectId: string;
  participationContextId: string;
  participationContextType: 'Phase' | 'Project';
  budgetingDescriptor: IIdeaData['attributes']['action_descriptor']['budgeting'];
}

interface State {
  error: 'unauthenticated' | 'budgetingDisabled' | null;
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

  disabledBudgetingClick = () => {
    this.setState({ error: 'budgetingDisabled' });
  }

  render() {
    const { ideaId, projectId, participationContextId, participationContextType, budgetingDescriptor } = this.props;
    const { error } = this.state;

    if (!error) {
      return (
        <AssignBudgetControl
          view="ideaPage"
          ideaId={ideaId}
          participationContextId={participationContextId}
          participationContextType={participationContextType}
          unauthenticatedAssignBudgetClick={this.unauthenticatedAssignBudgetClick}
          disabledAssignBudgetClick={this.disabledBudgetingClick}
        />
      );
    }

    if (error === 'budgetingDisabled') {
      return (
        <VotingPopContainer icon="lock-outlined">
          <AssignBudgetDisabled
            budgetingDescriptor={budgetingDescriptor}
            projectId={projectId}
          />
        </VotingPopContainer>
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

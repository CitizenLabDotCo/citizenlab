import React from 'react';
import styled from 'styled-components';

// components
import AssignBudgetWrapper from './AssignBudgetWrapper';

// typings
import { IParticipationContextType } from 'typings';

const ControlWrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
`;

interface Props {
  className?: string;
  participationContextId: string;
  participationContextType: IParticipationContextType;
  budgetingDescriptor: any;
  ideaId: string;
  projectId: string;
}

const BudgetAsssignment = ({
  className,
  participationContextId,
  participationContextType,
  budgetingDescriptor,
  ideaId,
  projectId,
}: Props) => {
  return (
    <ControlWrapper className={`${className}`}>
      <AssignBudgetWrapper
        ideaId={ideaId}
        projectId={projectId}
        participationContextId={participationContextId}
        participationContextType={participationContextType}
        budgetingDescriptor={budgetingDescriptor}
      />
    </ControlWrapper>
  );
};

export default BudgetAsssignment;

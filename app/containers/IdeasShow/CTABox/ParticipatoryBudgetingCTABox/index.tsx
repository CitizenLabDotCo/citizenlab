import React from 'react';
import styled from 'styled-components';
import BudgetAssignment from './BudgetAssignment';
import Buttons from '../Buttons';
import { colors } from 'utils/styleUtils';

// typings
import { IParticipationContextType } from 'typings';

const Container = styled.div`
  border-radius: 2px;
  padding-bottom: 30px;
  border-bottom: 1px solid ${colors.separation};
`;

const StyledBudgetAssignment = styled(BudgetAssignment)`
  margin-bottom: 30px;
`;

interface Props {
  className?: string;
  participationContextId: string;
  participationContextType: IParticipationContextType;
  budgetingDescriptor: any;
  ideaId: string;
  projectId: string;
}

const ParticipatoryBudgetingCTABox = (props: Props) => {
  const { ideaId } = props;

  // TODO: a11y title
  return (
    <Container>
      <StyledBudgetAssignment {...props} />
      <Buttons ideaId={ideaId} />
    </Container>
  );
};

export default ParticipatoryBudgetingCTABox;

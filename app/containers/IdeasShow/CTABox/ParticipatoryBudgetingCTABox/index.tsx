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
  background-color: #edeff0;
  padding: 25px 30px;
`;

const StyledBudgetAssignment = styled(BudgetAssignment)``;

export const ControlWrapperHorizontalRule: any = styled.hr`
  width: 100%;
  border: none;
  height: 1px;
  background-color: ${colors.separation};
  margin: 20px 0;
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

  return (
    <Container>
      <StyledBudgetAssignment {...props} />
      <ControlWrapperHorizontalRule aria-hidden />
      <Buttons ideaId={ideaId} />
    </Container>
  );
};

export default ParticipatoryBudgetingCTABox;

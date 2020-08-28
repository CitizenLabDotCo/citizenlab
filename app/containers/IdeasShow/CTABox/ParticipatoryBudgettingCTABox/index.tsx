import React from 'react';
import styled from 'styled-components';
import BudgetAssignment from './BudgetAssignment';
import GoToCommentsButton from '../Buttons/GoToCommentsButton';
import useIdea from 'hooks/useIdea';
import { isNilOrError } from 'utils/helperUtils';

// typings
import { IParticipationContextType } from 'typings';

const Container = styled.div`
  background-color: #edeff0; // TODO: add color to component library
  border-radius: 2px;
  padding: 25px 15px;
`;

const StyledGoToCommentsButton = styled(GoToCommentsButton)`
  margin-bottom: 10px;
`;

interface Props {
  className?: string;
  participationContextId: string;
  participationContextType: IParticipationContextType;
  budgetingDescriptor: any;
  ideaId: string;
  projectId: string;
}

const ParticipatoryBudgettingCTABox = (props: Props) => {
  const { ideaId, className } = props;
  const idea = useIdea({ ideaId });

  if (!isNilOrError(idea)) {
    const commentingEnabled =
      idea.attributes.action_descriptor.commenting.enabled;

    // TODO: a11y title
    return (
      <Container className={className}>
        <BudgetAssignment {...props} />
        {commentingEnabled && <StyledGoToCommentsButton />}
      </Container>
    );
  }

  return null;
};

export default ParticipatoryBudgettingCTABox;

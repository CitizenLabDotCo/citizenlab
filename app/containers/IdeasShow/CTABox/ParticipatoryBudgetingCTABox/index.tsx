import React from 'react';
import styled from 'styled-components';
import BudgetAssignment from './BudgetAssignment';
import Buttons from '../Buttons';
import { colors } from 'utils/styleUtils';
import { ScreenReaderOnly } from 'utils/a11y';

// i18n
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from './messages';

// typings
import { IParticipationContextType } from 'typings';

const Container = styled.div`
  border-radius: 2px;
  padding-bottom: 30px;
  border-bottom: 1px solid ${colors.separation};
  background-color: ${colors.background};
  padding: 25px 30px;
`;

const StyledBudgetAssignment = styled(BudgetAssignment)``;

const ControlWrapperHorizontalRule = styled.hr`
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

const ParticipatoryBudgetingCTABox = (props: Props & InjectedIntlProps) => {
  const {
    className,
    ideaId,
    intl: { formatMessage },
  } = props;

  return (
    <Container className={className}>
      <ScreenReaderOnly>
        <h2>{formatMessage(messages.a11y_ParticipatoryBudgeting)}</h2>
      </ScreenReaderOnly>
      <StyledBudgetAssignment {...props} />
      <ControlWrapperHorizontalRule aria-hidden />
      <Buttons ideaId={ideaId} />
    </Container>
  );
};

export default injectIntl(ParticipatoryBudgetingCTABox);

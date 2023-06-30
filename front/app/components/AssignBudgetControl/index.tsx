import React, { memo } from 'react';

// api
import useIdeaById from 'api/ideas/useIdeaById';

// components
import AddToBasketButton from './AddToBasketButton';
import { ScreenReaderOnly } from 'utils/a11y';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';
import FormattedBudget from 'utils/currency/FormattedBudget';

// styles
import styled from 'styled-components';
import { fontSizes, colors, defaultCardStyle, media } from 'utils/styleUtils';

const IdeaPageContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  ${media.tablet`
    padding: 20px;
    background: ${colors.background};
  `}
`;

const BudgetWithButtonWrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  justify-content: center;
`;

const Budget = styled.div`
  width: 100%;
  height: 90px;
  color: ${(props) => props.theme.colors.tenantText};
  font-size: ${fontSizes.m}px;
  font-weight: 600;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 3px;
  ${defaultCardStyle};
`;

interface Props {
  projectId: string;
  ideaId: string;
}

const AssignBudgetControl = memo(({ ideaId, projectId }: Props) => {
  const { data: idea } = useIdeaById(ideaId);

  const ideaBudget = idea?.data.attributes.budget;
  const actionDescriptor = idea?.data.attributes.action_descriptor.voting;

  if (!actionDescriptor || !ideaBudget) return null;

  return (
    <IdeaPageContainer
      className={`pbAssignBudgetControlContainer e2e-assign-budget`}
    >
      <BudgetWithButtonWrapper>
        <Budget>
          <ScreenReaderOnly>
            <FormattedMessage {...messages.a11y_price} />
          </ScreenReaderOnly>
          <FormattedBudget value={ideaBudget} />
        </Budget>
        <AddToBasketButton ideaId={ideaId} projectId={projectId} />
      </BudgetWithButtonWrapper>
    </IdeaPageContainer>
  );
});

export default AssignBudgetControl;

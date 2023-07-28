import React, { memo } from 'react';

// api
import useIdeaById from 'api/ideas/useIdeaById';

// components
import AddToBasketButton from './AddToBasketButton';
import { ScreenReaderOnly } from 'utils/a11y';
import { Box, Text } from '@citizenlab/cl2-component-library';
import VotesCounter from 'components/VotesCounter';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../_shared/messages';
import FormattedBudget from 'utils/currency/FormattedBudget';

// styles
import styled from 'styled-components';
import { fontSizes, colors, defaultCardStyle, media } from 'utils/styleUtils';

// typings
import { IProjectData } from 'api/projects/types';
import { IPhaseData } from 'api/phases/types';

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
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  ${defaultCardStyle};
`;

interface Props {
  ideaId: string;
  participationContext: IProjectData | IPhaseData;
}

const AddToBasketBox = memo(({ ideaId, participationContext }: Props) => {
  const { data: idea } = useIdeaById(ideaId);
  const ideaBudget = idea?.data.attributes.budget;
  const actionDescriptor = idea?.data.attributes.action_descriptor.voting;

  if (!actionDescriptor || !ideaBudget) {
    return null;
  }

  return (
    <IdeaPageContainer
      className={`pbAssignBudgetControlContainer e2e-assign-budget`}
    >
      <BudgetWithButtonWrapper>
        <Budget>
          <ScreenReaderOnly>
            <FormattedMessage {...messages.a11y_price} />
          </ScreenReaderOnly>
          <Box>
            <FormattedBudget value={ideaBudget} />
            <Text mb="0px" mt="8px" color="grey600" fontSize="xs">
              <VotesCounter participationContext={participationContext} />
            </Text>
          </Box>
        </Budget>
        <AddToBasketButton
          ideaId={ideaId}
          buttonStyle="primary"
          participationContext={participationContext}
          onIdeaPage
        />
      </BudgetWithButtonWrapper>
    </IdeaPageContainer>
  );
});

export default AddToBasketBox;

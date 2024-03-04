import React, { memo } from 'react';

import {
  Box,
  Text,
  fontSizes,
  colors,
  defaultCardStyle,
  media,
} from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import { ScreenReaderOnly } from 'utils/a11y';
import { FormattedMessage } from 'utils/cl-intl';
import FormattedBudget from 'utils/currency/FormattedBudget';
import { isNil } from 'utils/helperUtils';

import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import useVoting from 'api/baskets_ideas/useVoting';
import useIdeaById from 'api/ideas/useIdeaById';
import { IPhaseData } from 'api/phases/types';

import AddToBasketButton from './AddToBasketButton';
import messages from './messages';

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
  phase: IPhaseData;
}

const AddToBasketBox = memo(({ ideaId, phase }: Props) => {
  const { data: idea } = useIdeaById(ideaId);
  const { data: appConfig } = useAppConfiguration();
  const { numberOfVotesCast } = useVoting();

  const ideaBudget = idea?.data.attributes.budget;
  const actionDescriptor = idea?.data.attributes.action_descriptor.voting;
  const { voting_max_total } = phase.attributes;

  if (!actionDescriptor || !ideaBudget || isNil(voting_max_total)) {
    return null;
  }

  const budgetLeft = voting_max_total - (numberOfVotesCast ?? 0);
  const currency = appConfig?.data.attributes.settings.core.currency;

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
              <FormattedMessage
                {...messages.currencyLeft}
                values={{
                  budgetLeft: budgetLeft.toLocaleString(),
                  totalBudget: voting_max_total.toLocaleString(),
                  currency,
                }}
              />
            </Text>
          </Box>
        </Budget>
        <AddToBasketButton
          ideaId={ideaId}
          buttonStyle="primary"
          phase={phase}
          onIdeaPage
        />
      </BudgetWithButtonWrapper>
    </IdeaPageContainer>
  );
});

export default AddToBasketBox;

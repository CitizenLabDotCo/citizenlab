import React, { useState } from 'react';

import {
  Box,
  Button,
  colors,
  Tooltip,
} from '@citizenlab/cl2-component-library';
import JSConfetti from 'js-confetti';
import styled, { useTheme } from 'styled-components';

import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import useBasket from 'api/baskets/useBasket';
import useUpdateBasket from 'api/baskets/useUpdateBasket';
import useVoting from 'api/baskets_ideas/useVoting';
import { IPhaseData } from 'api/phases/types';
import { IProjectData } from 'api/projects/types';

import useLocalize from 'hooks/useLocalize';

import { triggerPostActionEvents } from 'containers/App/events';

import { ScreenReaderOnly } from 'utils/a11y';
import { FormattedMessage, useIntl } from 'utils/cl-intl';
import clHistory from 'utils/cl-router/history';
import useFormatCurrency from 'utils/currency/useFormatCurrency';
import { scrollToElement } from 'utils/scroll';

import messages from '../messages';

import { getVoteSubmissionDisabledExplanation } from './utils';

const confetti = new JSConfetti();

const StyledButton = styled(Button)`
  &.pulse {
    animation-name: pulse;
    animation-timing-function: ease;
    /* We set 1 second for the animation and run it 4 times to make sure we are a11y compliant (Under 5 seconds) */
    animation-iteration-count: 4;
    animation-duration: 1s;
    animation-delay: 0.3s;
    animation-fill-mode: forwards;
  }

  /* border-radius */
  -webkit-border-radius: 3px;
  -moz-border-radius: 3px;
  border-radius: 3px;

  @keyframes pulse {
    0% {
      box-shadow: 0 0 0 0 rgba(255, 255, 255, 1);
    }
    100% {
      box-shadow: 0 0 0 6px rgba(255, 255, 255, 0);
    }
  }

  &.disabled {
    border: solid 1px ${colors.white};
  }
`;

interface Props {
  phase: IPhaseData;
  project: IProjectData;
}

const CTAButton = ({ phase, project }: Props) => {
  const basketId = phase.relationships.user_basket?.data?.id;
  const { data: basket } = useBasket(basketId);
  const { mutate: updateBasket } = useUpdateBasket();
  const { numberOfVotesCast, processing: votingProcessing } = useVoting();
  const { data: appConfig } = useAppConfiguration();
  const formatCurrency = useFormatCurrency();
  const theme = useTheme();
  const { formatMessage } = useIntl();
  const localize = useLocalize();
  const [processing, setProcessing] = useState(false);
  const [isSubmitSuccessful, setIsSubmitSuccessful] = useState<boolean>(false);

  if (
    !appConfig ||
    !phase.attributes.voting_method ||
    numberOfVotesCast === undefined
  ) {
    return null;
  }

  const handleSubmitOnClick = () => {
    if (basket) {
      const update = () => {
        updateBasket(
          {
            id: basket.data.id,
            submitted: true,
          },
          {
            onSuccess: () => {
              setProcessing(false);
              setIsSubmitSuccessful(true);

              // If on the project page, scroll down to the status module
              if (location.pathname.includes('/projects/')) {
                confetti.addConfetti();
                scrollToElement({
                  id: 'voting-status-module',
                });
              }

              // If on the idea page, redirect to project page and scroll to status module
              if (location.pathname.includes('/ideas/')) {
                clHistory.push(
                  `/projects/${project.attributes.slug}?scrollToStatusModule=true`
                );
              }

              triggerPostActionEvents({});
            },
          }
        );
      };

      if (votingProcessing) {
        // Add a bit of timeout so that the voting request
        // has time to complete
        setTimeout(() => {
          update();
        }, 300);
      } else {
        update();
      }
    }
  };

  const permissionsDisabledReason =
    project.attributes.action_descriptors.voting.disabled_reason;
  const disabledExplanation = getVoteSubmissionDisabledExplanation(
    formatMessage,
    localize,
    phase,
    permissionsDisabledReason,
    numberOfVotesCast,
    formatCurrency
  );

  return (
    <>
      <Tooltip
        disabled={!disabledExplanation}
        placement="bottom"
        content={disabledExplanation}
      >
        {/* We need to add a tabIndex of 0 to
        make sure this is keyboard-focusable so screen reader software can read the explanation */}
        <Box width="100%" tabIndex={disabledExplanation ? 0 : -1}>
          <StyledButton
            icon="vote-ballot"
            buttonStyle="primary-inverse"
            onClick={handleSubmitOnClick}
            fontWeight="500"
            id="e2e-voting-submit-button"
            textHoverColor={theme.colors.black}
            padding="6px 12px"
            fontSize="14px"
            disabled={!!disabledExplanation}
            processing={processing}
            className={disabledExplanation ? '' : 'pulse'}
            ariaDescribedby="explanation"
            opacityDisabled="0.6"
            textDisabledColor={colors.black}
          >
            <FormattedMessage {...messages.submit} />
          </StyledButton>
          <ScreenReaderOnly id="explanation">
            {!!disabledExplanation && <>{disabledExplanation}</>}
          </ScreenReaderOnly>
        </Box>
      </Tooltip>
      <ScreenReaderOnly role="alert">
        {isSubmitSuccessful && (
          <FormattedMessage {...messages.budgetSubmitSuccess} />
        )}
      </ScreenReaderOnly>
    </>
  );
};

export default CTAButton;

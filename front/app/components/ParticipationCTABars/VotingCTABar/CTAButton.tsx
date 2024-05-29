import React, { useState } from 'react';

import { Box, Button } from '@citizenlab/cl2-component-library';
import Tippy from '@tippyjs/react';
import JSConfetti from 'js-confetti';
import styled, { useTheme } from 'styled-components';

import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import useBasket from 'api/baskets/useBasket';
import useUpdateBasket from 'api/baskets/useUpdateBasket';
import useVoting from 'api/baskets_ideas/useVoting';
import { IPhaseData } from 'api/phases/types';
import { IProjectData } from 'api/projects/types';

import useLocalize from 'hooks/useLocalize';

import { ScreenReaderOnly } from 'utils/a11y';
import { FormattedMessage, useIntl } from 'utils/cl-intl';
import clHistory from 'utils/cl-router/history';
import { scrollToElement } from 'utils/scroll';

import messages from '../messages';

import { getNumberOfVotesDisabledExplanation } from './utils';

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
  const theme = useTheme();
  const { formatMessage } = useIntl();
  const localize = useLocalize();
  const [processing, setProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

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
              setSuccessMessage(formatMessage(messages.submitSuccess)); // Set success message

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

  const disabledExplanation = getNumberOfVotesDisabledExplanation(
    formatMessage,
    localize,
    phase,
    numberOfVotesCast,
    appConfig.data.attributes.settings.core.currency
  );

  return (
    <>
      <Tippy
        disabled={!disabledExplanation}
        interactive={true}
        placement="bottom"
        content={disabledExplanation}
      >
        {/* We need to add a tabIndex when the explanation is shown to
        make sure this is focusable when disabled to read the explanation */}
        <Box width="100%" tabIndex={disabledExplanation ? 0 : -1}>
          <StyledButton
            icon="vote-ballot"
            buttonStyle="secondary"
            iconColor={theme.colors.tenantText}
            onClick={handleSubmitOnClick}
            fontWeight="500"
            bgColor={theme.colors.white}
            textColor={theme.colors.tenantText}
            id="e2e-voting-submit-button"
            textHoverColor={theme.colors.black}
            padding="6px 12px"
            fontSize="14px"
            disabled={!!disabledExplanation}
            processing={processing}
            className={disabledExplanation ? '' : 'pulse'}
            ariaDescribedby="explanation"
          >
            <FormattedMessage {...messages.submit} />
          </StyledButton>
          {disabledExplanation && (
            <ScreenReaderOnly id="explanation">
              {disabledExplanation}
            </ScreenReaderOnly>
          )}
        </Box>
      </Tippy>
      {successMessage && (
        <ScreenReaderOnly role="alert">{successMessage}</ScreenReaderOnly>
      )}
    </>
  );
};

export default CTAButton;

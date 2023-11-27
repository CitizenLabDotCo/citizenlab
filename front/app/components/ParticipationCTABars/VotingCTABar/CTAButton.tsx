import React, { useState } from 'react';

// api
import useBasket from 'api/baskets/useBasket';
import useUpdateBasket from 'api/baskets/useUpdateBasket';
import useVoting from 'api/baskets_ideas/useVoting';
import useAppConfiguration from 'api/app_configuration/useAppConfiguration';

// components
import { Box, Button } from '@citizenlab/cl2-component-library';
import Tippy from '@tippyjs/react';

// styling
import { useTheme } from 'styled-components';

// i18n
import { FormattedMessage, useIntl } from 'utils/cl-intl';
import messages from '../messages';
import useLocalize from 'hooks/useLocalize';

// utils
import JSConfetti from 'js-confetti';
import { scrollToElement } from 'utils/scroll';
import { getDisabledExplanation } from './utils';

// typings
import { IProjectData } from 'api/projects/types';
import { IPhaseData } from 'api/phases/types';

const confetti = new JSConfetti();

interface Props {
  participationContext: IProjectData | IPhaseData;
}

const CTAButton = ({ participationContext }: Props) => {
  const [processing, setProcessing] = useState(false);

  const basketId = participationContext.relationships.user_basket?.data?.id;

  const { data: basket } = useBasket(basketId);
  const { mutate: updateBasket } = useUpdateBasket();
  const { numberOfVotesCast, processing: votingProcessing } = useVoting();
  const { data: appConfig } = useAppConfiguration();
  const theme = useTheme();
  const { formatMessage } = useIntl();
  const localize = useLocalize();

  const votingMethod = participationContext.attributes.voting_method;
  if (!votingMethod || numberOfVotesCast === undefined) return null;

  const currency = appConfig?.data.attributes.settings.core.currency;

  const disabledExplanation = getDisabledExplanation(
    formatMessage,
    localize,
    participationContext,
    numberOfVotesCast,
    currency
  );

  const handleSubmitOnClick = () => {
    if (basket) {
      const update = () => {
        updateBasket(
          {
            id: basket.data.id,
            submitted: true,
            participation_context_type:
              participationContext.type === 'phase' ? 'Phase' : 'Project',
          },
          {
            onSuccess: () => {
              setProcessing(false);
              confetti.addConfetti();
              scrollToElement({
                id: 'voting-status-module',
              });
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

  return (
    <Tippy
      disabled={!disabledExplanation}
      interactive={true}
      placement="bottom"
      content={disabledExplanation}
    >
      <Box width="100%">
        <Button
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
        >
          <FormattedMessage {...messages.submit} />
        </Button>
      </Box>
    </Tippy>
  );
};

export default CTAButton;

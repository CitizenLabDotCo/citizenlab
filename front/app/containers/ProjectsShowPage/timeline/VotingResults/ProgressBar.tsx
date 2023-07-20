import React from 'react';

// api
import usePhase from 'api/phases/usePhase';

// components
import { Box, Text, Icon } from '@citizenlab/cl2-component-library';
import Tippy from '@tippyjs/react';

// styling
import { useTheme } from 'styled-components';
import { stylingConsts } from 'utils/styleUtils';
import { transparentize } from 'polished';

// i18n
import { useIntl } from 'utils/cl-intl';
import useLocalize from 'hooks/useLocalize';
import messages from 'components/VoteInputs/multiple/AssignMultipleVotesInput/messages';

interface Props {
  phaseId: string;
  votes?: number;
  votesPercentage: number;
  baskets?: number;
  tooltip?: string;
}

const ProgressBar = ({
  phaseId,
  votes,
  votesPercentage,
  baskets,
  tooltip,
}: Props) => {
  const theme = useTheme();
  const { formatMessage } = useIntl();
  const localize = useLocalize();
  const { data: phase } = usePhase(phaseId);

  if (!phase) return null;

  const { voting_term_singular_multiloc, voting_term_plural_multiloc } =
    phase.data.attributes;

  const votingTermSingular =
    localize(voting_term_singular_multiloc) ||
    formatMessage(messages.vote).toLowerCase();
  const votingTermPlural =
    localize(voting_term_plural_multiloc) ||
    formatMessage(messages.votes).toLowerCase();

  return (
    <Tippy
      disabled={!tooltip}
      content={tooltip}
      interactive={true}
      placement="bottom"
    >
      <Box
        w="100%"
        h="28px"
        borderRadius={stylingConsts.borderRadius}
        bgColor={transparentize(0.9, theme.colors.tenantPrimary)}
        position="relative"
      >
        <Box
          w={`${votesPercentage}%`}
          h="100%"
          bgColor={transparentize(0.75, theme.colors.primary)}
          borderRadius={stylingConsts.borderRadius}
        />
        <Box
          position="absolute"
          left="0"
          top="0"
          h="28px"
          display="flex"
          alignItems="center"
        >
          <Text
            m="0"
            color="tenantPrimary"
            ml="12px"
            fontSize="s"
            fontWeight="bold"
          >
            {votes ? (
              <>
                {`${votesPercentage}% (${votes} ${formatMessage(
                  messages.xVotes,
                  {
                    votes,
                    singular: votingTermSingular,
                    plural: votingTermPlural,
                  }
                )})`}
              </>
            ) : (
              <>{votesPercentage}%</>
            )}
          </Text>
        </Box>
        {baskets !== undefined && (
          <Box
            position="absolute"
            top="0"
            right="0"
            h="28px"
            display="flex"
            alignItems="center"
          >
            <Text mb="0" mt="1px" mr="4px" color="primary">
              {baskets}
            </Text>
            <Icon
              name="user"
              width="20px"
              height="20px"
              mr="12px"
              fill={theme.colors.primary}
            />
          </Box>
        )}
      </Box>
    </Tippy>
  );
};

export default ProgressBar;

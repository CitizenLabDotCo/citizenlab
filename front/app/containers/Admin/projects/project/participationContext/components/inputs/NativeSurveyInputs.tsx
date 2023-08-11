import React from 'react';
import AnonymousPostingToggle from 'components/admin/AnonymousPostingToggle/AnonymousPostingToggle';

// components
import { Box, IconTooltip, Text } from '@citizenlab/cl2-component-library';

// intl
import messages from '../messages';
import { FormattedMessage, useIntl } from 'utils/cl-intl';

interface Props {
  allow_anonymous_participation: boolean | null | undefined;
  handleAllowAnonymousParticipationOnChange: (
    allow_anonymous_participation: boolean
  ) => void;
}

export default ({
  allow_anonymous_participation,
  handleAllowAnonymousParticipationOnChange,
}: Props) => {
  const { formatMessage } = useIntl();
  return (
    <AnonymousPostingToggle
      allow_anonymous_participation={allow_anonymous_participation}
      handleAllowAnonymousParticipationOnChange={
        handleAllowAnonymousParticipationOnChange
      }
      toggleLabel={
        <Box ml="8px">
          <Box display="flex">
            <Text
              color="primary"
              mb="0px"
              fontSize="m"
              style={{ fontWeight: 600 }}
            >
              <FormattedMessage {...messages.userAnonymityLabelMain} />
            </Text>
            <Box ml="4px" mt="16px">
              <IconTooltip
                placement="top-start"
                content={formatMessage(messages.userAnonymityLabelTooltip)}
              />
            </Box>
          </Box>

          <Text color="coolGrey600" mt="0px" fontSize="m">
            <FormattedMessage {...messages.userAnonymityLabelSubtext} />
          </Text>
        </Box>
      }
    />
  );
};

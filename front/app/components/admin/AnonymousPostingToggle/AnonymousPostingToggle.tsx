import {
  Toggle,
  Text,
  Box,
  IconTooltip,
} from '@citizenlab/cl2-component-library';
import { SectionField, SubSectionTitle } from 'components/admin/Section';
import React from 'react';
import messages from './messages';
import { FormattedMessage, useIntl } from 'utils/cl-intl';

interface AnonymousPostingToggleProps {
  allow_anonymous_participation: boolean | null | undefined;
  handleAllowAnonymousParticipationOnChange: (
    allow_anonymous_participation: boolean
  ) => void;
}

export const AnonymousPostingToggle = ({
  allow_anonymous_participation,
  handleAllowAnonymousParticipationOnChange,
}: AnonymousPostingToggleProps) => {
  const { formatMessage } = useIntl();

  return (
    <SectionField>
      <SubSectionTitle style={{ marginBottom: '0px' }}>
        <FormattedMessage {...messages.userPrivacy} />
      </SubSectionTitle>
      <Toggle
        checked={allow_anonymous_participation || false}
        onChange={() => {
          handleAllowAnonymousParticipationOnChange(
            !allow_anonymous_participation
          );
        }}
        label={
          <Box ml="8px">
            <Box display="flex">
              <Text color="primary" mb="0px" fontSize="m" fontWeight="bold">
                <FormattedMessage {...messages.userPrivacyLabelText} />
              </Text>
              <Box ml="4px" mt="16px">
                <IconTooltip
                  placement="top-start"
                  content={formatMessage(messages.userPrivacyLabelTooltip)}
                />
              </Box>
            </Box>

            <Text color="primary" mt="0px" fontSize="s">
              <FormattedMessage {...messages.userPrivacyLabelSubtext} />
            </Text>
          </Box>
        }
      />
    </SectionField>
  );
};

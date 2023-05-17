import { Toggle, Text } from '@citizenlab/cl2-component-library';
import { SubSectionTitle } from 'components/admin/Section';
import React from 'react';
import messages from '../../messages';
import { StyledSectionField } from './styling';
import { FormattedMessage } from 'utils/cl-intl';

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
  return (
    <StyledSectionField>
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
          <>
            <Text color="primary" mb="0px" fontSize="m" fontWeight="bold">
              <FormattedMessage {...messages.userPrivacyLabelText} />
            </Text>
            <Text color="primary" mt="0px" fontSize="s">
              <FormattedMessage {...messages.userPrivacyLabelSubtext} />
            </Text>
          </>
        }
      />
    </StyledSectionField>
  );
};

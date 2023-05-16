import { Toggle, Text } from '@citizenlab/cl2-component-library';
import { SubSectionTitle } from 'components/admin/Section';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import messages from '../../messages';
import { StyledSectionField } from './styling';

interface AnonymousPostingToggleProps {
  allow_anonymous_posting: boolean | null | undefined;
  handleAllowAnonymousPostingOnChange: (
    allow_anonymous_posting: boolean
  ) => void;
}

export const AnonymousPostingToggle = ({
  allow_anonymous_posting,
  handleAllowAnonymousPostingOnChange,
}: AnonymousPostingToggleProps) => {
  return (
    <StyledSectionField>
      <SubSectionTitle style={{ marginBottom: '0px' }}>
        <FormattedMessage {...messages.userPrivacy} />
      </SubSectionTitle>
      <Toggle
        checked={allow_anonymous_posting || false}
        onChange={() => {
          handleAllowAnonymousPostingOnChange(!allow_anonymous_posting);
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

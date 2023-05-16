import React from 'react';

// components
import { SectionField, SubSectionTitle } from 'components/admin/Section';
import { Toggle, Text } from '@citizenlab/cl2-component-library';

// i18n
import { FormattedMessage, useIntl } from 'utils/cl-intl';
import messages from '../messages';

interface Props {
  enabled: boolean;
  onToggle: () => void;
}

const AnonymousPostingToggle = ({ enabled, onToggle }: Props) => {
  const { formatMessage } = useIntl();
  return (
    <SectionField>
      <SubSectionTitle style={{ marginBottom: '0px' }}>
        {formatMessage(messages.userPrivacy)}
      </SubSectionTitle>
      <Toggle
        checked={enabled}
        onChange={onToggle}
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
    </SectionField>
  );
};

export default AnonymousPostingToggle;

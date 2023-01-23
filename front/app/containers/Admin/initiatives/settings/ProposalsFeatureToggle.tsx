import React from 'react';

// components
import { SectionField } from 'components/admin/Section';
import { Toggle, Text } from '@citizenlab/cl2-component-library';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';

interface Props {
  enabled: boolean;
  onToggle: () => void;
}

const ProposalsFeatureToggle = ({ enabled, onToggle }: Props) => {
  return (
    <SectionField>
      <Toggle
        checked={enabled}
        onChange={onToggle}
        label={
          <Text fontSize="m">
            <FormattedMessage {...messages.enableProposals} />
          </Text>
        }
      />
    </SectionField>
  );
};

export default ProposalsFeatureToggle;

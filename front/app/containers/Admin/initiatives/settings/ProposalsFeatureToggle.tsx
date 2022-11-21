import React from 'react';
import styled from 'styled-components';

// components
import { SectionField } from 'components/admin/Section';
import { Toggle, Text } from '@citizenlab/cl2-component-library';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';

const StyledToggle = styled(Toggle)`
  margin-right: 10px;
`;

interface Props {
  enabled: boolean;
  onToggle: () => void;
}

const ProposalsFeatureToggle = ({ enabled, onToggle }: Props) => {
  return (
    <SectionField>
      <StyledToggle
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

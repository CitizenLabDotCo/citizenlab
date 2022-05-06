import React from 'react';
import styled from 'styled-components';
import { StyledSectionDescription } from '.';

// components
import {
  SectionField,
  SubSectionTitleWithDescription,
} from 'components/admin/Section';
import { Toggle } from '@citizenlab/cl2-component-library';

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
      <SubSectionTitleWithDescription>
        <FormattedMessage {...messages.showProposalEnabled} />
      </SubSectionTitleWithDescription>
      <StyledSectionDescription>
        <FormattedMessage {...messages.showProposalEnabledInfo} />
      </StyledSectionDescription>
      <StyledToggle
        checked={enabled}
        onChange={onToggle}
        label={<FormattedMessage {...messages.enabledToggle} />}
      />
    </SectionField>
  );
};

export default ProposalsFeatureToggle;

import React, { useState } from 'react';
import styled from 'styled-components';
import { StyledSectionDescription } from '.';

// components
import {
  SectionField,
  SubSectionTitleWithDescription,
} from 'components/admin/Section';
import { Toggle } from '@citizenlab/cl2-component-library';
import Outlet from 'components/Outlet';

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

export default ({ enabled, onToggle }: Props) => {
  const [navbarModuleActive, setNavbarModuleActive] = useState(false);
  const setNavbarModuleActiveToTrue = () => setNavbarModuleActive(true);

  return (
    <>
      <Outlet
        id="app.containers.Admin.initiatives.settings.EnableSwitch"
        onMount={setNavbarModuleActiveToTrue}
      />

      {!navbarModuleActive && (
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
      )}
    </>
  );
};

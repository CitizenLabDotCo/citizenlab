import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { StyledSectionDescription } from '.';

// hooks
import useNavbarItemEnabled from 'hooks/useNavbarItemEnabled';

// components
import {
  SectionField,
  SubSectionTitleWithDescription,
} from 'components/admin/Section';
import { Toggle } from 'cl2-component-library';
import Outlet from 'components/Outlet';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';
import { isNilOrError } from 'utils/helperUtils';

const StyledToggle = styled(Toggle)`
  margin-right: 10px;
`;

interface Props {
  setParentState: (state: any) => void;
}

export default ({ setParentState }: Props) => {
  const proposalsNavbarItemEnabled = useNavbarItemEnabled('proposals');

  const [proposalsNavbarToggleValue, setProposalsNavbarToggleValue] = useState<
    undefined | boolean
  >(undefined);

  const [navbarModuleActive, setNavbarModuleActive] = useState(false);

  const toggleProposalsNavbarValue = () =>
    setProposalsNavbarToggleValue(!proposalsNavbarToggleValue);

  const setNavbarModuleActiveToTrue = () => setNavbarModuleActive(true);

  useEffect(() => {
    if (isNilOrError(proposalsNavbarItemEnabled)) return;
    setProposalsNavbarToggleValue(proposalsNavbarItemEnabled);
  }, [proposalsNavbarItemEnabled]);

  useEffect(() => {
    setParentState({
      updateProposalsInNavbar:
        proposalsNavbarToggleValue === proposalsNavbarItemEnabled
          ? null
          : proposalsNavbarToggleValue,
    });
  }, [proposalsNavbarToggleValue]);

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
          {proposalsNavbarToggleValue !== undefined && (
            <StyledToggle
              checked={proposalsNavbarToggleValue}
              onChange={toggleProposalsNavbarValue}
              label={<FormattedMessage {...messages.enabledToggle} />}
            />
          )}
        </SectionField>
      )}
    </>
  );
};

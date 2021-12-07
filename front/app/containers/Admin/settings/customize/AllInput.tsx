import React, { useState } from 'react';

// hooks
import useNavbarItemEnabled from 'hooks/useNavbarItemEnabled';

// components
import Outlet from 'components/Outlet';
import { SectionField } from 'components/admin/Section';
import {
  Setting,
  StyledToggle,
  ToggleLabel,
  LabelContent,
  LabelTitle,
  LabelDescription,
} from '../general';
import { StyledSection, StyledSectionTitle } from './Events';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';

// utils
import { isNilOrError } from 'utils/helperUtils';

interface Props {
  navbarItemSetting: boolean | null;
  setParentState: (state: any) => void;
}

const AllInput = ({ navbarItemSetting, setParentState }: Props) => {
  const navbarItemEnabled = useNavbarItemEnabled('all_input');
  if (isNilOrError(navbarItemEnabled)) return null;

  const [navbarModuleActive, setNavbarModuleActive] = useState(false);
  const setNavbarModuleActiveToTrue = () => setNavbarModuleActive(true);

  const handleToggle = () => {
    if (navbarItemSetting === null) {
      setParentState({
        updateEventsInNavbar: !navbarItemEnabled,
      });
      return;
    }

    const newValue = !navbarItemSetting;

    setParentState({
      updateEventsInNavbar: newValue === navbarItemEnabled ? null : newValue,
    });
  };

  return (
    <>
      <Outlet
        id="app.containers.Admin.settings.customize.AllInput"
        onMount={setNavbarModuleActiveToTrue}
      />

      {!navbarModuleActive && (
        <StyledSection>
          <StyledSectionTitle>
            <FormattedMessage {...messages.allInputSection} />
          </StyledSectionTitle>

          <SectionField>
            <Setting>
              <ToggleLabel>
                <StyledToggle
                  checked={
                    navbarItemSetting === null
                      ? navbarItemEnabled
                      : navbarItemSetting
                  }
                  onChange={handleToggle}
                />
                <LabelContent>
                  <LabelTitle>
                    <FormattedMessage {...messages.allInputPageSetting} />
                  </LabelTitle>
                  <LabelDescription>
                    <FormattedMessage
                      {...messages.allInputPageSettingDescription}
                    />
                  </LabelDescription>
                </LabelContent>
              </ToggleLabel>
            </Setting>
          </SectionField>
        </StyledSection>
      )}
    </>
  );
};

export default AllInput;

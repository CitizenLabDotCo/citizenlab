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
import messages from './messages';

// utils
import { isNilOrError } from 'utils/helperUtils';

interface Props {
  newNavbarItemEnabled: boolean | null;
  setParentState: (state: any) => void;
}

const AllInput = ({ newNavbarItemEnabled, setParentState }: Props) => {
  const navbarItemEnabled = useNavbarItemEnabled('all_input');

  const [navbarModuleActive, setNavbarModuleActive] = useState(false);
  const setNavbarModuleActiveToTrue = () => setNavbarModuleActive(true);

  if (isNilOrError(navbarItemEnabled)) return null;

  const handleToggle = () => {
    if (newNavbarItemEnabled === null) {
      setParentState({
        newAllInputNavbarItemEnabled: !navbarItemEnabled,
      });
      return;
    }

    const newValue = !newNavbarItemEnabled;

    setParentState({
      newAllInputNavbarItemEnabled:
        newValue === navbarItemEnabled ? null : newValue,
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
                    newNavbarItemEnabled === null
                      ? navbarItemEnabled
                      : newNavbarItemEnabled
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

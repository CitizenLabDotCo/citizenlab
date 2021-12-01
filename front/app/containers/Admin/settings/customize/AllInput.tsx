import React, { useState, useEffect } from 'react';

// hooks
import useNavbarItemEnabled from 'hooks/useNavbarItemEnabled';

// components
import Outlet from 'components/Outlet';
import { Section, SectionTitle, SectionField } from 'components/admin/Section';
import {
  Setting,
  StyledToggle,
  ToggleLabel,
  LabelContent,
  LabelTitle,
  LabelDescription,
} from '../general';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';

// utils
import { isNilOrError } from 'utils/helperUtils';

interface Props {
  setParentState: (state: any) => void;
}

const AllInput = ({ setParentState }: Props) => {
  const allInputNavbarItemEnabled = useNavbarItemEnabled('all_input');

  const [allInputNavbarToggleValue, setAllInputNavbarToggleValue] = useState<
    undefined | boolean
  >(undefined);

  const [navbarModuleActive, setNavbarModuleActive] = useState(false);

  const toggleAllInputNavbarValue = () =>
    setAllInputNavbarToggleValue(!allInputNavbarToggleValue);

  const setNavbarModuleActiveToTrue = () => setNavbarModuleActive(true);

  useEffect(() => {
    if (isNilOrError(allInputNavbarItemEnabled)) return;
    setAllInputNavbarToggleValue(allInputNavbarItemEnabled);
  }, [allInputNavbarItemEnabled]);

  useEffect(() => {
    setParentState({
      updateAllInputInNavbar:
        allInputNavbarToggleValue === allInputNavbarItemEnabled
          ? null
          : allInputNavbarToggleValue,
    });
  }, [allInputNavbarToggleValue]);

  return (
    <>
      <Outlet
        id="app.containers.Admin.settings.customize.AllInput"
        onMount={setNavbarModuleActiveToTrue}
      />

      {!navbarModuleActive && allInputNavbarToggleValue !== undefined && (
        <Section>
          <SectionTitle>
            <FormattedMessage {...messages.allInputSection} />
          </SectionTitle>

          <SectionField>
            <Setting>
              <ToggleLabel>
                <StyledToggle
                  checked={allInputNavbarToggleValue}
                  onChange={toggleAllInputNavbarValue}
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
        </Section>
      )}
    </>
  );
};

export default AllInput;

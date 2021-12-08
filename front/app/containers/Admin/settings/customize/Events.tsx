import React, { useState } from 'react';
import styled from 'styled-components';

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
import { InjectedIntlProps } from 'react-intl';
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import messages from './messages';

// utils
import { isNilOrError } from 'utils/helperUtils';

export const StyledSection = styled(Section)`
  margin-bottom 20px;
`;

export const StyledSectionTitle = styled(SectionTitle)`
  margin-bottom 30px;
`;

export const EventsToggleSectionField = styled(SectionField)`
  margin: 0;
`;

interface Props {
  newNavbarItemEnabled: boolean | null;
  setParentState: (state: any) => void;
  getSetting: (setting: string) => any;
}

const Events = ({
  newNavbarItemEnabled,
  setParentState,
  getSetting,
  intl: { formatMessage },
}: Props & InjectedIntlProps) => {
  const navbarItemEnabled = useNavbarItemEnabled('events');

  const [navbarModuleActive, setNavbarModuleActive] = useState(false);
  const setNavbarModuleActiveToTrue = () => setNavbarModuleActive(true);

  if (isNilOrError(navbarItemEnabled)) return null;

  const handleToggle = () => {
    if (newNavbarItemEnabled === null) {
      setParentState({
        newEventsNavbarItemEnabled: !navbarItemEnabled,
      });
      return;
    }

    const newValue = !newNavbarItemEnabled;

    setParentState({
      newEventsNavbarItemEnabled:
        newValue === navbarItemEnabled ? null : newValue,
    });
  };

  return (
    <>
      <Outlet
        id="app.containers.Admin.settings.customize.Events"
        onMount={setNavbarModuleActiveToTrue}
      />

      <StyledSection>
        <StyledSectionTitle>
          <FormattedMessage {...messages.eventsSection} />
        </StyledSectionTitle>

        {!navbarModuleActive && (
          <EventsToggleSectionField>
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
                    {formatMessage(messages.eventsPageSetting)}
                  </LabelTitle>
                  <LabelDescription>
                    {formatMessage(messages.eventsPageSettingDescription)}
                  </LabelDescription>
                </LabelContent>
              </ToggleLabel>
            </Setting>
          </EventsToggleSectionField>
        )}

        <Outlet
          id="app.containers.Admin.settings.customize.eventsSectionEnd"
          getSetting={getSetting}
          setParentState={setParentState}
        />
      </StyledSection>
    </>
  );
};

export default injectIntl(Events);

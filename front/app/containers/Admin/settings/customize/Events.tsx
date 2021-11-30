import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

// hooks
import useNavbarItemEnabled from 'hooks/useNavbarItemEnabled';

// components
import { Section, SectionTitle, SectionField } from 'components/admin/Section';
import {
  Setting,
  StyledToggle,
  ToggleLabel,
  LabelContent,
  LabelTitle,
  LabelDescription,
} from '../general';
import Outlet from 'components/Outlet';

// i18n
import { InjectedIntlProps } from 'react-intl';
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import messages from '../messages';

// utils
import { get } from 'lodash-es';
import { isNilOrError } from 'utils/helperUtils';

export const EventsToggleSectionField = styled(SectionField)`
  margin: 0;
`;

const EventsSectionTitle = styled(SectionTitle)`
  margin-bottom 30px;
`;

const EventsSection = styled(Section)`
  margin-bottom 20px;
`;

interface Props {
  setParentState: (state: any) => void;
  getSetting: (setting: string) => any;
}

const Events = ({
  setParentState,
  getSetting,
  intl: { formatMessage },
}: Props & InjectedIntlProps) => {
  const eventsNavbarItemEnabled = useNavbarItemEnabled('events');

  const [eventsNavbarToggleValue, setEventsNavbarToggleValue] = useState<
    undefined | boolean
  >(undefined);

  const [navbarModuleActive, setNavbarModuleActive] = useState(false);

  const toggleEventsNavbarValue = () =>
    setEventsNavbarToggleValue(!eventsNavbarToggleValue);

  const setNavbarModuleActiveToTrue = () => setNavbarModuleActive(true);

  useEffect(() => {
    if (isNilOrError(eventsNavbarItemEnabled)) return;
    setEventsNavbarToggleValue(eventsNavbarItemEnabled);
  }, [eventsNavbarItemEnabled]);

  useEffect(() => {
    setParentState({
      updateEventsInNavbar:
        eventsNavbarToggleValue === eventsNavbarItemEnabled
          ? null
          : eventsNavbarToggleValue,
    });
  }, [eventsNavbarToggleValue]);

  const handleToggleEventsWidget = () => {
    const previousValue = getSetting('events_widget.enabled');

    setParentState((state) => {
      return {
        attributesDiff: {
          ...state.attributesDiff,
          settings: {
            ...state.settings,
            ...get(state.attributesDiff, 'settings', {}),
            events_widget: {
              ...get(state.settings, 'events_widget', {}),
              ...get(state.attributesDiff, 'settings.events_widget', {}),
              enabled: !previousValue,
            },
          },
        },
      };
    });
  };

  return (
    <>
      <Outlet
        id="app.containers.Admin.settings.customize.Events"
        onMount={setNavbarModuleActiveToTrue}
      />

      <EventsSection>
        <EventsSectionTitle>
          <FormattedMessage {...messages.eventsSection} />
        </EventsSectionTitle>

        {!navbarModuleActive && eventsNavbarToggleValue !== undefined && (
          <EventsToggleSectionField>
            <Setting>
              <ToggleLabel>
                <StyledToggle
                  checked={eventsNavbarToggleValue}
                  onChange={toggleEventsNavbarValue}
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
          checked={getSetting('events_widget.enabled')}
          onChange={handleToggleEventsWidget}
        />
      </EventsSection>
    </>
  );
};

export default injectIntl(Events);

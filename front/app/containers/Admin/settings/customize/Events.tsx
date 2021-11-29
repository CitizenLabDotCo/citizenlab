import React from 'react';
import styled from 'styled-components';

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
import FeatureFlag from 'components/FeatureFlag';

// i18n
import { InjectedIntlProps } from 'react-intl';
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import messages from '../messages';

// utils
import { get } from 'lodash-es';

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
  const handleToggleEventsPage = () => {
    const previousValue = getSetting('events_page.enabled');

    setParentState((state) => {
      return {
        attributesDiff: {
          ...state.attributesDiff,
          settings: {
            ...state.settings,
            ...get(state.attributesDiff, 'settings', {}),
            events_page: {
              ...get(state.settings, 'events_page', {}),
              ...get(state.attributesDiff, 'settings.events_page', {}),
              enabled: !previousValue,
            },
          },
        },
      };
    });
  };

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
    <FeatureFlag name="events_page" onlyCheckAllowed>
      <EventsSection>
        <EventsSectionTitle>
          <FormattedMessage {...messages.eventsSection} />
        </EventsSectionTitle>

        <EventsToggleSectionField>
          <Setting>
            <ToggleLabel>
              <StyledToggle
                checked={getSetting('events_page.enabled')}
                onChange={handleToggleEventsPage}
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

        <Outlet
          id="app.containers.Admin.settings.customize.eventsSectionEnd"
          checked={getSetting('events_widget.enabled')}
          onChange={handleToggleEventsWidget}
        />
      </EventsSection>
    </FeatureFlag>
  );
};

export default injectIntl(Events);

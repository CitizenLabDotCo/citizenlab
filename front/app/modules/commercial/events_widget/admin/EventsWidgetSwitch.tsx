import React from 'react';
import { get } from 'lodash-es';

// components
import { EventsToggleSectionField } from 'containers/Admin/settings/customize/Events';
import {
  Setting,
  ToggleLabel,
  StyledToggle,
  LabelContent,
  LabelTitle,
  LabelDescription,
} from 'containers/Admin/settings/general';

// i18n
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from './messages';

interface Props {
  getSetting: (settingName: string) => any;
  setParentState: (state: any) => void;
}

const EventsWidgetSwitch = ({
  getSetting,
  setParentState,
  intl: { formatMessage },
}: Props & InjectedIntlProps) => {
  const currentSwitchValue = getSetting('events_widget.enabled');

  const handleChange = () => {
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
              enabled: !currentSwitchValue,
            },
          },
        },
      };
    });
  };
  return (
    <EventsToggleSectionField>
      <Setting>
        <ToggleLabel>
          <StyledToggle checked={currentSwitchValue} onChange={handleChange} />
          <LabelContent>
            <LabelTitle>
              {formatMessage(messages.eventsWidgetSetting)}
            </LabelTitle>
            <LabelDescription>
              {formatMessage(messages.eventsWidgetSettingDescription)}
            </LabelDescription>
          </LabelContent>
        </ToggleLabel>
      </Setting>
    </EventsToggleSectionField>
  );
};

export default injectIntl(EventsWidgetSwitch);

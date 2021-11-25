import React from 'react';

// Components
import { WideSectionField } from 'containers/Admin/settings/customize';
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
  checked: boolean;
  onChange: () => void;
}

const EventsWidgetSwitch = ({
  checked,
  onChange,
  intl: { formatMessage },
}: Props & InjectedIntlProps) => (
  <WideSectionField>
    <Setting>
      <ToggleLabel>
        <StyledToggle checked={checked} onChange={onChange} />
        <LabelContent>
          <LabelTitle>{formatMessage(messages.eventsWidgetSetting)}</LabelTitle>
          <LabelDescription>
            {formatMessage(messages.eventsWidgetSettingDescription)}
          </LabelDescription>
        </LabelContent>
      </ToggleLabel>
    </Setting>
  </WideSectionField>
);

export default injectIntl(EventsWidgetSwitch);

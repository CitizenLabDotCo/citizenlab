import { useEffect } from 'react';
import { InsertConfigurationOptions } from 'typings';
import messages from './messages';
import { TSectionToggleData } from 'containers/Admin/pagesAndMenu/containers/EditHomepage';

export interface Props {
  onData: (data: InsertConfigurationOptions<TSectionToggleData>) => void;
}

const SectionToggle = ({ onData }: Props) => {
  useEffect(
    () =>
      onData({
        configuration: {
          name: 'events_widget_enabled',
          titleMessageDescriptor: messages.eventsWidgetSetting,
          tooltipMessageDescriptor: messages.eventsWidgetSettingDescription,
        },
        insertBeforeName: 'bottom_info_section_enabled',
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );
  return null;
};

export default SectionToggle;

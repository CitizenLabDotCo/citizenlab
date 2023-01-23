import { useEffect } from 'react';
import { InsertConfigurationOptions } from 'typings';
import messages from './messages';
import { IHomepageSectionToggleData } from 'containers/Admin/pagesAndMenu/containers/EditHomepage';
import { useIntl } from 'utils/cl-intl';

export interface Props {
  onData: (
    data: InsertConfigurationOptions<IHomepageSectionToggleData>
  ) => void;
}

const SectionToggle = ({ onData }: Props) => {
  const { formatMessage } = useIntl();
  useEffect(
    () =>
      onData({
        configuration: {
          name: 'events_widget_enabled',
          titleMessage: formatMessage(messages.eventsWidgetSetting),
          tooltipMessage: formatMessage(
            messages.eventsWidgetSettingDescription
          ),
        },
        insertBeforeName: 'bottom_info_section_enabled',
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );
  return null;
};

export default SectionToggle;

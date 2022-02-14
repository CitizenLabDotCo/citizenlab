import { FC, useEffect } from 'react';
import { InjectedIntlProps } from 'react-intl';
import { InsertConfigurationOptions, ITab } from 'typings';
import { injectIntl } from 'utils/cl-intl';
import messages from './messages';

type Props = {
  onData: (data: InsertConfigurationOptions<ITab>) => void;
};

const ProjectEditTab: FC<Props & InjectedIntlProps> = ({
  onData,
  intl: { formatMessage },
}) => {
  const tabName = 'topics';
  useEffect(() => {
    onData({
      configuration: {
        label: formatMessage(messages.allowedInputTopicsTab),
        name: tabName,
        url: 'allowed-input-topics',
        feature: 'custom_topics',
      },
      insertBeforeName: 'phases',
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
};

export default injectIntl(ProjectEditTab);

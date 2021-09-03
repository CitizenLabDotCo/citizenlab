import { FC, useEffect } from 'react';

import { InjectedIntlProps } from 'react-intl';
import { InsertConfigurationOptions, ITab } from 'typings';
import { injectIntl } from 'utils/cl-intl';

import messages from './messages';

interface Props {
  onData: (data: InsertConfigurationOptions<ITab>) => void;
}

const Tab: FC<Props & InjectedIntlProps> = ({
  onData,
  intl: { formatMessage },
}) => {
  const tabName = 'ideaform';
  useEffect(() => {
    onData({
      configuration: {
        label: formatMessage(messages.inputFormTab),
        url: 'ideaform',
        feature: 'idea_custom_fields',
        name: tabName,
      },
      insertAfterName: 'survey-results',
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
};

export default injectIntl(Tab);

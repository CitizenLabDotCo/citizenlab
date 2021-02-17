import { FC, useEffect } from 'react';

import { InjectedIntlProps } from 'react-intl';
import { InsertTabOptions } from 'typings';
import { injectIntl } from 'utils/cl-intl';

import messages from './messages';

interface Props {
  onData: (data: InsertTabOptions) => void;
}

const Tab: FC<Props & InjectedIntlProps> = ({
  onData,
  intl: { formatMessage },
}) => {
  useEffect(() => {
    onData({
      tabConfiguration: {
        label: formatMessage(messages.ideaFormTab),
        url: `ideaform`,
        feature: 'idea_custom_fields',
        name: 'ideaform',
      },
      insertAfterTabName: 'survey-results',
    });
  }, []);
  return null;
};

export default injectIntl(Tab);

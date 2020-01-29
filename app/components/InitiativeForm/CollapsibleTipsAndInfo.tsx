import React, { memo } from 'react';

// components
import TipsContent from './TipsContent';
import CollapsibleBox from 'components/UI/CollapsibleBox';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

export interface Props {
  className?: string;
}

const CollapsibleTipsAndInfo = memo<Props>(({ className }: Props) => {
  return (
    <CollapsibleBox
      className={className}
      titleIconName="info"
      title={<FormattedMessage {...messages.tipsTitle} />}
      content={<TipsContent />}
    />
  );

});

export default CollapsibleTipsAndInfo;

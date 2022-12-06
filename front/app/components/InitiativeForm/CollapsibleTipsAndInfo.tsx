import React, { memo } from 'react';
// i18n
import { FormattedMessage } from 'utils/cl-intl';
// styling
import { colors } from 'utils/styleUtils';
// components
import CollapsibleBox from 'components/UI/CollapsibleBox';
import messages from './messages';

const TipsContent = React.lazy(() => import('./TipsContent'));

export interface Props {
  className?: string;
}

const CollapsibleTipsAndInfo = memo<Props>(({ className }) => {
  return (
    <CollapsibleBox
      className={className}
      titleIconName="info-outline"
      title={<FormattedMessage {...messages.tipsTitle} />}
      contentBackgroundColor={colors.grey200}
    >
      <TipsContent />
    </CollapsibleBox>
  );
});

export default CollapsibleTipsAndInfo;

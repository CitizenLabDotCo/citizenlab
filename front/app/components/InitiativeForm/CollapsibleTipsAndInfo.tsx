import React, { memo } from 'react';

// components
import CollapsibleBox from 'components/UI/CollapsibleBox';
const TipsContent = React.lazy(() => import('./TipsContent'));

// styling
import { colors } from 'utils/styleUtils';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

export interface Props {
  className?: string;
}

const CollapsibleTipsAndInfo = memo<Props>(({ className }) => {
  return (
    <CollapsibleBox
      className={className}
      titleIconName="info"
      title={<FormattedMessage {...messages.tipsTitle} />}
      contentBackgroundColor={colors.lightGreyishBlue}
    >
      <TipsContent />
    </CollapsibleBox>
  );
});

export default CollapsibleTipsAndInfo;

import React, { memo } from 'react';

// components
import CollapsibleBox from 'components/UI/CollapsibleBox';

// styling
import { colors } from 'utils/styleUtils';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

export interface Props {
  className?: string;
}

const CollapsibleTipsAndInfo = memo<Props>(({ className }: Props) => {
  const TipsContent = React.lazy(() => import('./TipsContent'));

  return (
    <CollapsibleBox
      className={className}
      titleIconName="info"
      title={<FormattedMessage {...messages.tipsTitle} />}
      lazyLoadedContent={<TipsContent />}
      contentBackgroundColor={colors.lightGreyishBlue}
    />
  );

});

export default CollapsibleTipsAndInfo;

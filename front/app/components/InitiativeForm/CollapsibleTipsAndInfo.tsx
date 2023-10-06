import React from 'react';

// components
import CollapsibleBox from 'components/UI/CollapsibleBox';
const TipsContent = React.lazy(() => import('./TipsContent'));

// styling
import { colors } from 'utils/styleUtils';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import useLocalize from 'hooks/useLocalize';

interface Props {
  className?: string;
}

const CollapsibleTipsAndInfo = ({ className }: Props) => {
  const { data: appConfiguration } = useAppConfiguration();
  const localize = useLocalize();

  const postingTips = localize(
    appConfiguration?.data.attributes.settings.initiatives.posting_tips
  );

  if (postingTips.length === 0) return null;

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
};

export default CollapsibleTipsAndInfo;

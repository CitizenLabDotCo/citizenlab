import React from 'react';

import CollapsibleBox from 'components/UI/CollapsibleBox';
const TipsContent = React.lazy(() => import('./TipsContent'));

import { colors } from '@citizenlab/cl2-component-library';

import { FormattedMessage } from 'utils/cl-intl';

import useAppConfiguration from 'api/app_configuration/useAppConfiguration';

import useLocalize from 'hooks/useLocalize';

import messages from './messages';

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

import React from 'react';

import { Tooltip } from '@citizenlab/cl2-component-library';

import useFeatureFlag from 'hooks/useFeatureFlag';

import { FormattedMessage } from 'utils/cl-intl';

import messages from './messages';

interface Props {
  children: React.ComponentProps<typeof Tooltip>['children'];
  selected: boolean;
}

const CardButtonTooltip = ({ children, selected }: Props) => {
  const isGranularPermissionsEnabled = useFeatureFlag({
    name: 'granular_permissions',
  });

  return (
    <Tooltip
      disabled={selected || isGranularPermissionsEnabled}
      content={<FormattedMessage {...messages.granularPermissionsOffText} />}
    >
      {children}
    </Tooltip>
  );
};

export default CardButtonTooltip;

import React from 'react';

import SettingToggleRow from 'components/admin/SettingToggleRow';

import { useIntl } from 'utils/cl-intl';

import messages from '../../../messages';

interface Props {
  checked: boolean;
  external?: boolean;
  onChange: () => void;
}

const ResponseCollectionToggle = ({ checked, external, onChange }: Props) => {
  const { formatMessage } = useIntl();

  return (
    <SettingToggleRow
      title={formatMessage(messages.acceptNewResponses)}
      description={formatMessage(
        external ? messages.pauseExternalResponses : messages.pausePollResponses
      )}
      checked={checked}
      onChange={onChange}
    />
  );
};

export default ResponseCollectionToggle;

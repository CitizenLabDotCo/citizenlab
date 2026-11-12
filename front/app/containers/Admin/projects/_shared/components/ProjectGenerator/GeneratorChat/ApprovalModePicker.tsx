import React from 'react';

import OptionPicker from 'components/UI/OptionPicker';

import { useIntl } from 'utils/cl-intl';

import messages from '../messages';

type Props = {
  autoApprove: boolean;
  onChange: (autoApprove: boolean) => void;
};

const ApprovalModePicker = ({ autoApprove, onChange }: Props) => {
  const { formatMessage } = useIntl();

  return (
    <OptionPicker
      title={formatMessage(messages.approvalModeTitle)}
      description={formatMessage(messages.approvalModeDescription)}
      options={[
        {
          value: 'ask',
          label: formatMessage(messages.askBeforeApplying),
          description: formatMessage(messages.askBeforeApplyingDescription),
          icon: 'user-check',
        },
        {
          value: 'auto',
          label: formatMessage(messages.applyAutomatically),
          description: formatMessage(messages.applyAutomaticallyDescription),
          icon: 'flash',
        },
      ]}
      value={autoApprove ? 'auto' : 'ask'}
      onChange={(mode) => onChange(mode === 'auto')}
    />
  );
};

export default ApprovalModePicker;

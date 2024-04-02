import React from 'react';

import { IOption, Select } from '@citizenlab/cl2-component-library';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';

interface Props {
  onChange: (selectedOption: IOption) => void;
  selectedPreviewDevice: TDevice;
}
export type TDevice = 'phone' | 'tablet' | 'desktop';

const Component = ({ onChange, selectedPreviewDevice }: Props) => {
  const { formatMessage } = useIntl();
  return (
    <Select
      label={formatMessage(messages.bgHeaderPreviewSelectLabel)}
      id="display-preview-device"
      options={[
        {
          value: 'phone',
          label: formatMessage(messages.phone),
        },
        {
          value: 'tablet',
          label: formatMessage(messages.tablet),
        },
        {
          value: 'desktop',
          label: formatMessage(messages.desktop),
        },
      ]}
      onChange={onChange}
      value={selectedPreviewDevice}
    />
  );
};

export default Component;

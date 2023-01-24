import React from 'react';
import { IOption, Select } from '@citizenlab/cl2-component-library';
import { useIntl } from 'utils/cl-intl';
import messages from './messages';
import { TPreviewDevice } from '.';

interface Props {
  onChange: (selectedOption: IOption) => void;
  selectedPreviewDevice: TPreviewDevice;
}

const Component = ({ onChange, selectedPreviewDevice }: Props) => {
  const { formatMessage } = useIntl();
  return (
    <Select
      label={formatMessage(messages.bgHeaderPreviewSelectLabel)}
      id="display-preview-device"
      options={[
        {
          value: 'desktop',
          label: formatMessage(messages.desktop),
        },
        {
          value: 'tablet',
          label: formatMessage(messages.tablet),
        },
        {
          value: 'phone',
          label: formatMessage(messages.phone),
        },
      ]}
      onChange={onChange}
      value={selectedPreviewDevice}
    />
  );
};

export default Component;

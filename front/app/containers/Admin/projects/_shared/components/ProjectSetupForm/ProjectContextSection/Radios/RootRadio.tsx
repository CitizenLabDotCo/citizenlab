import React from 'react';

import { Radio } from '@citizenlab/cl2-component-library';

import { FormattedMessage, MessageDescriptor } from 'utils/cl-intl';

import { LabelHeaderDescription } from '../../../labels';
import messages from '../messages';
import { Props } from '../types';

const RootRadio = ({
  projectContext,
  onSetContext,
  descriptionMessage,
}: Props & { descriptionMessage: MessageDescriptor }) => {
  return (
    <Radio
      name="root"
      value="root"
      currentValue={projectContext}
      label={
        <LabelHeaderDescription
          header={<FormattedMessage {...messages.root} />}
          description={<FormattedMessage {...descriptionMessage} />}
        />
      }
      onChange={() => onSetContext('root')}
    />
  );
};

export default RootRadio;

import React from 'react';

import { Toggle } from '@citizenlab/cl2-component-library';

import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';

interface Props {
  checked: boolean;
  onChange: () => void;
}

const PreviewToggle = (props: Props) => (
  <Toggle
    id="e2e-preview-toggle"
    label={<FormattedMessage {...messages.preview} />}
    {...props}
  />
);

export default PreviewToggle;

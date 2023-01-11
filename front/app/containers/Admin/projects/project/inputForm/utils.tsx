import React from 'react';

// types
import { FormBuilderConfig } from 'components/FormBuilder/utils';

// intl
import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';

export const ideationConfig: FormBuilderConfig = {
  getFormBuilderTitle: () => {
    return <FormattedMessage {...messages.inputForm} />;
  },
};

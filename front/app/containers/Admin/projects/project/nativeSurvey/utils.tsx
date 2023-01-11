import React from 'react';

// types
import { FormBuilderConfig } from 'components/FormBuilder/utils';

// intl
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

export const nativeSurveyConfig: FormBuilderConfig = {
  getFormBuilderTitle: () => {
    return <FormattedMessage {...messages.survey} />;
  },
};

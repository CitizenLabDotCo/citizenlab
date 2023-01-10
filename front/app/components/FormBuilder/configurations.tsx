import React, { ReactNode } from 'react';
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

export type FormBuilderConfig = {
  getFormBuilderTitle: () => ReactNode | JSX.Element | null;
};

export const ideationConfig: FormBuilderConfig = {
  getFormBuilderTitle: () => {
    return <FormattedMessage {...messages.inputForm} />;
  },
};

export const nativeSurveyConfig: FormBuilderConfig = {
  getFormBuilderTitle: () => {
    return <FormattedMessage {...messages.survey} />;
  },
};

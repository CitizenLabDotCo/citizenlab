import React from 'react';
import { withRouter, WithRouterProps } from 'react-router';
import clHistory from 'utils/cl-router/history';
import { Formik } from 'formik';
import { CLErrorsJSON } from 'typings';
import { isCLErrorJSON } from 'utils/errorUtils';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';

// services
import { addUserCustomFieldOption } from 'services/userCustomFieldOptions';

// components
import { Section, SectionTitle } from 'components/admin/Section';
import RegistrationCustomFieldOptionsForm, {
  FormValues,
} from './RegistrationCustomFieldOptionsForm';

export interface Props {
  userCustomFieldId: string;
}

const RegistrationCustomFieldOptionsNew = ({
  params: { userCustomFieldId },
}: Props & WithRouterProps) => {
  const handleSubmit = (
    values: FormValues,
    { setErrors, setSubmitting, setStatus }
  ) => {
    addUserCustomFieldOption(userCustomFieldId, {
      title_multiloc: values.title_multiloc,
    })
      .then(() => {
        clHistory.push(
          `/admin/settings/registration/custom-fields/${userCustomFieldId}/options/`
        );
      })
      .catch((errorResponse) => {
        if (isCLErrorJSON(errorResponse)) {
          const apiErrors = (errorResponse as CLErrorsJSON).json.errors;
          setErrors(apiErrors);
        } else {
          setStatus('error');
        }
        setSubmitting(false);
      });
  };

  const renderFn = (props) => {
    return <RegistrationCustomFieldOptionsForm {...props} />;
  };

  return (
    <Section>
      <SectionTitle>
        <FormattedMessage {...messages.newCustomFieldAnswerOptionFormTitle} />
      </SectionTitle>
      <Formik
        initialValues={{
          title_multiloc: {},
        }}
        render={renderFn}
        onSubmit={handleSubmit}
        validate={(RegistrationCustomFieldOptionsForm as any).validate}
      />
    </Section>
  );
};

export default withRouter(RegistrationCustomFieldOptionsNew);

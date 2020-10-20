import React from 'react';
import { withRouter, WithRouterProps } from 'react-router';
import { isNilOrError } from 'utils/helperUtils';
import clHistory from 'utils/cl-router/history';
import { Formik } from 'formik';
import { CLErrorsJSON } from 'typings';
import { isCLErrorJSON } from 'utils/errorUtils';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';

// hooks
import useUserCustomFieldOption from 'hooks/useUserCustomFieldOption';

// services
import { updateUserCustomFieldOption } from 'services/userCustomFieldOptions';

// components
import GoBackButton from 'components/UI/GoBackButton';
import { Section, SectionTitle } from 'components/admin/Section';
import OptionsEditForm, { FormValues } from './OptionsEditForm';

export interface Props {
  userCustomFieldId: string;
}

const OptionsEdit = ({
  params: { userCustomFieldId, userCustomFieldOptionId },
}: Props & WithRouterProps) => {
  const userCustomFieldOption = useUserCustomFieldOption(
    userCustomFieldId,
    userCustomFieldOptionId
  );
  const handleSubmit = (
    values: FormValues,
    { setErrors, setSubmitting, setStatus }
  ) => {
    updateUserCustomFieldOption(userCustomFieldId, userCustomFieldOptionId, {
      title_multiloc: values.title_multiloc,
    })
      .then(() => {
        clHistory.push(
          `/admin/settings/registration/custom_fields/${userCustomFieldId}/options-order/`
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
    return <OptionsEditForm {...props} />;
  };

  const goBack = () => {
    clHistory.push(
      `/admin/settings/registration/custom_fields/${userCustomFieldId}/options-order/`
    );
  };

  if (!isNilOrError(userCustomFieldOption)) {
    return (
      <Section>
        <GoBackButton onClick={goBack} />
        <SectionTitle>
          <FormattedMessage {...messages.editCustomFieldOptionFormTitle} />
        </SectionTitle>
        <Formik
          initialValues={{
            title_multiloc: userCustomFieldOption.attributes.title_multiloc,
          }}
          render={renderFn}
          onSubmit={handleSubmit}
          validate={(OptionsEditForm as any).validate}
        />
      </Section>
    );
  }

  return null;
};

export default withRouter(OptionsEdit);

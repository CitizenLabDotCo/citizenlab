import React from 'react';
import { withRouter, WithRouterProps } from 'react-router';
import { isNilOrError } from 'utils/helperUtils';
import clHistory from 'utils/cl-router/history';

import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';

// hooks
import useUserCustomFieldOption from 'hooks/useUserCustomFieldOption';
import useUserCustomFieldOptions from 'hooks/useUserCustomFieldOptions';
import useLocalize from 'hooks/useLocalize';

import { updateArea } from 'services/areas';

import GoBackButton from 'components/UI/GoBackButton';
import { Section, SectionTitle } from 'components/admin/Section';

import { Formik } from 'formik';
import OptionsEditForm, { FormValues } from './OptionsEditForm';

import { CLErrorsJSON } from 'typings';
import { isCLErrorJSON } from 'utils/errorUtils';

export interface Props {}

const OptionsEdit = ({ params }: WithRouterProps) => {
  const userCustomFieldOption = useUserCustomFieldOption();
  const localize = useLocalize();
  const handleSubmit = (
    values: FormValues,
    { setErrors, setSubmitting, setStatus }
  ) => {
    // updateArea(area.id, {
    //   ...values,
    // })
    //   .then(() => {
    //     clHistory.push('/admin/settings/areas');
    //   })
    //   .catch((errorResponse) => {
    //     if (isCLErrorJSON(errorResponse)) {
    //       const apiErrors = (errorResponse as CLErrorsJSON).json.errors;
    //       setErrors(apiErrors);
    //     } else {
    //       setStatus('error');
    //     }
    //     setSubmitting(false);
    //   });
  };

  const renderFn = (props) => {
    return <OptionsEditForm {...props} />;
  };

  const goBack = () => {
    // clHistory.push(
    //   `/admin/settings/registration/custom_fields/${userCustomFieldId}/options-order/`
    // );
  };

  if (!isNilOrError(userCustomFieldOption)) {
    return (
      <Section>
        <GoBackButton onClick={goBack} />
        <SectionTitle>
          <FormattedMessage
            {...messages.editCustomFieldOptionFormTitle}
            values={{
              customField: `${localize(
                userCustomFieldOption.attributes.title_multiloc
              )}`,
            }}
          />
        </SectionTitle>
        <Formik
          initialValues={{
            title_multiloc: userCustomFieldOption.attributes.title_multiloc,
            description_multiloc:
              userCustomFieldOption.attributes.description_multiloc,
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

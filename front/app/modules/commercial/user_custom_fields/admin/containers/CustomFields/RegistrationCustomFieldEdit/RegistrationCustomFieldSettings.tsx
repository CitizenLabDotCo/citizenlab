import React from 'react';
import { keys, pick, isEqual } from 'lodash-es';
import { CLErrorsJSON } from 'typings';
import clHistory from 'utils/cl-router/history';
import { useParams } from 'react-router-dom';
import { isNilOrError } from 'utils/helperUtils';

import {
  updateCustomFieldForUsers,
  isBuiltInField,
} from '../../../../services/userCustomFields';
import useUserCustomField from '../../../../hooks/useUserCustomField';

import RegistrationCustomFieldForm, {
  FormValues,
} from '../RegistrationCustomFieldForm';

import { Formik } from 'formik';
import { isCLErrorJSON } from 'utils/errorUtils';

const RegistrationCustomFieldSettings = () => {
  const { userCustomFieldId } = useParams();
  if (!userCustomFieldId) return null;

  const customField = useUserCustomField(userCustomFieldId);
  if (isNilOrError(customField)) return null;

  const initialValues = () => {
    return (
      customField && {
        input_type: customField.attributes.input_type,
        title_multiloc: customField.attributes.title_multiloc,
        description_multiloc: customField.attributes.description_multiloc,
        required: customField.attributes.required,
        enabled: customField.attributes.enabled,
      }
    );
  };

  const changedValues = (initialValues, newValues) => {
    const changedKeys = keys(newValues).filter(
      (key) => !isEqual(initialValues[key], newValues[key])
    );
    return pick(newValues, changedKeys);
  };

  const handleSubmit = (
    values: FormValues,
    { setErrors, setSubmitting, setStatus }
  ) => {
    if (!customField) return;

    updateCustomFieldForUsers(customField.id, {
      ...changedValues(initialValues(), values),
    })
      .then(() => {
        clHistory.push('/admin/settings/registration');
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
    return (
      customField && (
        <RegistrationCustomFieldForm
          {...props}
          mode="edit"
          customFieldId={customField.id}
          builtInField={isBuiltInField(customField)}
        />
      )
    );
  };

  return (
    <Formik
      initialValues={initialValues()}
      onSubmit={handleSubmit}
      render={renderFn}
      validate={RegistrationCustomFieldForm['validate']}
    />
  );
};

export default RegistrationCustomFieldSettings;

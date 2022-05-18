import React from 'react';
import { keys, pick, isEqual } from 'lodash-es';
import { CLErrorsJSON } from 'typings';
import clHistory from 'utils/cl-router/history';

import {
  updateCustomFieldForUsers,
  isBuiltInField,
} from '../../../../services/userCustomFields';

import RegistrationCustomFieldForm, {
  FormValues,
} from '../RegistrationCustomFieldForm';

import { useUserCustomFieldOutletContext } from '.';

import { Formik } from 'formik';
import { isCLErrorJSON } from 'utils/errorUtils';

class RegistrationCustomFieldSettings extends React.Component {
  initialValues = () => {
    const { customField } = useUserCustomFieldOutletContext();
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

  changedValues = (initialValues, newValues) => {
    const changedKeys = keys(newValues).filter(
      (key) => !isEqual(initialValues[key], newValues[key])
    );
    return pick(newValues, changedKeys);
  };

  handleSubmit = (
    values: FormValues,
    { setErrors, setSubmitting, setStatus }
  ) => {
    const { customField } = useUserCustomFieldOutletContext();
    if (!customField) return;

    updateCustomFieldForUsers(customField.id, {
      ...this.changedValues(this.initialValues(), values),
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

  renderFn = (props) => {
    const { customField } = useUserCustomFieldOutletContext();

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

  render() {
    const { customField } = useUserCustomFieldOutletContext();

    return (
      customField && (
        <Formik
          initialValues={this.initialValues()}
          onSubmit={this.handleSubmit}
          render={this.renderFn}
          validate={RegistrationCustomFieldForm['validate']}
        />
      )
    );
  }
}

export default RegistrationCustomFieldSettings;

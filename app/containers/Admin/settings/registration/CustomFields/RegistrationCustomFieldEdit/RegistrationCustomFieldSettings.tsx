import React from 'react';
import { keys, pick, isEqual } from 'lodash-es';
import { CLErrorsJSON } from 'typings';
import clHistory from 'utils/cl-router/history';

import {
  IUserCustomFieldData,
  updateCustomFieldForUsers,
  isBuiltInField,
} from 'services/userCustomFields';

import RegistrationCustomFieldForm, {
  FormValues,
} from '../RegistrationCustomFieldForm';
import { Formik } from 'formik';
import { isCLErrorJSON } from 'utils/errorUtils';

type Props = {
  customField: IUserCustomFieldData;
};

type State = {};

class RegistrationCustomFieldSettings extends React.Component<Props, State> {
  initialValues = () => {
    const { customField } = this.props;
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
    const { customField } = this.props;
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

  renderFn = (props) =>
    this.props.customField && (
      <RegistrationCustomFieldForm
        {...props}
        mode="edit"
        customFieldId={this.props.customField.id}
        builtInField={isBuiltInField(this.props.customField)}
      />
    );

  render() {
    const { customField } = this.props;

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

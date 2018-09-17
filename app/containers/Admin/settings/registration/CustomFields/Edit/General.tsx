import React from 'react';
import { keys, pick, isEqual } from 'lodash-es';
import { CLErrorsJSON } from 'typings';
import clHistory from 'utils/cl-router/history';

import { ICustomFieldData, updateCustomFieldForUsers } from 'services/userCustomFields';

import CustomFieldForm, { FormValues } from '../CustomFieldForm';
import { Formik } from 'formik';

type Props = {
  customField: ICustomFieldData;
};

type State = {};

class General extends React.Component<Props, State> {

  initialValues = () => {
    const { customField } = this.props;
    return customField && {
      input_type: customField.attributes.input_type,
      title_multiloc: customField.attributes.title_multiloc,
      description_multiloc: customField.attributes.description_multiloc,
      required: customField.attributes.required,
      enabled: customField.attributes.enabled,
    };
  }

  changedValues = (initialValues, newValues) => {
    const changedKeys = keys(newValues).filter((key) => (
      !isEqual(initialValues[key], newValues[key])
    ));
    return pick(newValues, changedKeys);
  }

  handleSubmit = (values: FormValues, { setErrors, setSubmitting }) => {
    const { customField } = this.props;
    if (!customField) return;

    updateCustomFieldForUsers(customField.id, {
      ...this.changedValues(this.initialValues(), values)
    })
      .then(() => {
        clHistory.push('/admin/settings/registration');
      })
      .catch((errorResponse) => {
        const apiErrors = (errorResponse as CLErrorsJSON).json.errors;
        setErrors(apiErrors);
        setSubmitting(false);
      });
  }

  renderFn = (props) => (
    this.props.customField && (
      <CustomFieldForm
        {...props}
        mode="edit"
        customFieldId={this.props.customField.id}
      />
    )
  )

  render() {
    const { customField } = this.props;

    return customField && (
      <Formik
        initialValues={this.initialValues()}
        onSubmit={this.handleSubmit}
        render={this.renderFn}
        validate={CustomFieldForm.validate}
      />
    );
  }
}

export default General;

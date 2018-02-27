import * as React from 'react';
import { keys, pick, isEqual } from 'lodash';
import { ICustomFieldData, updateCustomFieldForUsers } from 'services/userCustomFields';
import CustomFieldForm, { FormValues } from '../CustomFieldForm';
import { Formik } from 'formik';
import { API } from 'typings';
import { browserHistory } from 'react-router';


type Props = {
  customField: ICustomFieldData;
};

type State = {};

class General extends React.Component<Props, State> {

  initialValues = () => {
    const { customField } = this.props;
    return customField && {
      key: customField.attributes.key,
      input_type: customField.attributes.input_type,
      title_multiloc: customField.attributes.title_multiloc,
      description_multiloc: customField.attributes.description_multiloc,
      required: customField.attributes.required,
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
        browserHistory.push('/admin/custom_fields');
      })
      .catch((errorResponse) => {
        const apiErrors = (errorResponse as API.ErrorResponse).json.errors;
        setErrors(apiErrors);
        setSubmitting(false);
      });
  }

  hasOptions = (inputType) => {
    return inputType === 'select' || inputType === 'multi_select';
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
      />
    );
  }
}

export default General;

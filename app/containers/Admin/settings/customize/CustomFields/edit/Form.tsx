import * as React from 'react';
// import { flow } from 'lodash';
// import styled from 'styled-components';
import { withFormik, FormikProps, Form, Field, FormikBag } from 'formik';
import { ICustomFieldData, IInputType, updateCustomFieldForUsers } from 'services/userCustomFields';

import FormikInput from 'components/UI/FormikInput';
import FormikInputMultiloc from 'components/UI/FormikInputMultiloc';
import FormikTextAreaMultiloc from 'components/UI/FormikTextAreaMultiloc';
import FormikToggle from 'components/UI/FormikToggle';
import FormikSelect from 'components/UI/FormikSelect';
import { Section, SectionTitle, SectionField } from 'components/admin/Section';
import Label from 'components/UI/Label';
// import { InjectedIntlProps } from 'react-intl';
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';
import { Multiloc, API } from 'typings';

// Shape of form values
interface FormValues {
  key: string;
  input_type: IInputType;
  title_multiloc: Multiloc;
  description_multiloc: Multiloc;
  required: boolean;
}

interface OtherProps {
}

interface OuterProps {
  customField: ICustomFieldData;
}

const inputTypeOptions = () => {
  const fieldTypes = ['text', 'multiline_text', 'select', 'multiselect', 'checkbox', 'date'];
  return fieldTypes.map(optionForInputType);
};


const optionForInputType = (inputType) => (
  {
    value: inputType,
    label: <FormattedMessage {...messages[`inputType_${inputType}`]} />,
  }
);

const InnerForm = (props: OtherProps & FormikProps<FormValues>) => {

    const { isSubmitting } = props;
    // const { touched, errors, isSubmitting, values } = props;
    return (
      <Form>
        <Section>
          <SectionTitle>
            Field configuration
          </SectionTitle>

          <SectionField>
            <Label>
              <FormattedMessage {...messages.fieldInputType} />
            </Label>
            <Field
              name="input_type"
              component={FormikSelect}
              options={inputTypeOptions()}
            />
          </SectionField>

          <SectionField>
            <Label>
              <FormattedMessage {...messages.fieldKey} />
            </Label>
            <Field
              name="key"
              component={FormikInput}
            />
          </SectionField>

          <SectionField>
            <Field
              name="title_multiloc"
              component={FormikInputMultiloc}
              label={<FormattedMessage {...messages.fieldTitle} />}
            />
          </SectionField>

          <SectionField>
            <Field
              name="description_multiloc"
              component={FormikTextAreaMultiloc}
              label={<FormattedMessage {...messages.fieldDescription} />}
            />
          </SectionField>

          <SectionField>
            <Label>
              <FormattedMessage {...messages.fieldRequired} />
            </Label>
            <Field
              name="required"
              component={FormikToggle}
            />
          </SectionField>

        </Section>

        <button type="submit" disabled={isSubmitting}>
          Submit
        </button>
      </Form>
    );
};


const mapPropsToValues = (props: OuterProps): FormValues => {
  const { customField } = props;
  return {
    key: props.customField.attributes.key,
    input_type: props.customField.attributes.input_type,
    title_multiloc: customField.attributes.title_multiloc,
    description_multiloc: customField.attributes.description_multiloc,
    required: customField.attributes.required,
  };
};

const handleSubmit = (values: FormValues, formikBag: FormikBag<OuterProps, FormValues>) => {
  const { props, setErrors, setSubmitting } = formikBag;
  updateCustomFieldForUsers(props.customField.id, {
    ...values
  })
    .then(() => {
      alert('Victory!');
    })
    .catch((errorResponse) => {
      const apiErrors = (errorResponse as API.ErrorResponse).json.errors;
      setErrors(apiErrors);
      setSubmitting(false);
    });
};

export default withFormik<OuterProps, FormValues>({ mapPropsToValues, handleSubmit })(InnerForm);

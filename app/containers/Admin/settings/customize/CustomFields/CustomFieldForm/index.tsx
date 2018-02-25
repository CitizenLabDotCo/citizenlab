import * as React from 'react';
import { IInputType } from 'services/userCustomFields';

import { Form, Field, InjectedFormikProps } from 'formik';
import FormikInput from 'components/UI/FormikInput';
import FormikInputMultiloc from 'components/UI/FormikInputMultiloc';
import FormikTextAreaMultiloc from 'components/UI/FormikTextAreaMultiloc';
import FormikToggle from 'components/UI/FormikToggle';
import FormikSelect from 'components/UI/FormikSelect';
import Error from 'components/UI/Error';
import { Section, SectionTitle, SectionField } from 'components/admin/Section';
import Label from 'components/UI/Label';
import FormikSubmitWrapper from 'components/admin/FormikSubmitWrapper';


import { FormattedMessage } from 'utils/cl-intl';
import { Multiloc } from 'typings';
import messages from '../messages';

export interface FormValues {
  key: string;
  input_type: IInputType;
  title_multiloc: Multiloc;
  description_multiloc: Multiloc;
  required: boolean;
}

export interface Props {
  mode: 'new' | 'edit';
}

class CustomFieldForm extends React.Component<InjectedFormikProps<Props, FormValues>> {

  inputTypeOptions = () => {
    const fieldTypes = ['text', 'multiline_text', 'select', 'multiselect', 'checkbox', 'date'];
    return fieldTypes.map((inputType) => ({
      value: inputType,
      label: <FormattedMessage {...messages[`inputType_${inputType}`]} />,
    }));
  }

  render() {

    const { isSubmitting, mode, errors, isValid, touched } = this.props;

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
              options={this.inputTypeOptions()}
              disabled={mode === 'edit'}
            />
            <Error apiErrors={errors.input_type} />
          </SectionField>

          <SectionField>
            <Label>
              <FormattedMessage {...messages.fieldKey} />
            </Label>
            <Field
              name="key"
              component={FormikInput}
              disabled={mode === 'edit'}
            />
            <Error apiErrors={errors.key} />
          </SectionField>

          <SectionField>
            <Field
              name="title_multiloc"
              component={FormikInputMultiloc}
              label={<FormattedMessage {...messages.fieldTitle} />}
            />
            <Error apiErrors={errors.title_multiloc} />
          </SectionField>

          <SectionField>
            <Field
              name="description_multiloc"
              component={FormikTextAreaMultiloc}
              label={<FormattedMessage {...messages.fieldDescription} />}
            />
            <Error apiErrors={errors.description_multiloc} />
          </SectionField>

          <SectionField>
            <Label>
              <FormattedMessage {...messages.fieldRequired} />
            </Label>
            <Field
              name="required"
              component={FormikToggle}
            />
            <Error apiErrors={errors.required} />
          </SectionField>

        </Section>

        <FormikSubmitWrapper
          {...{ isValid, isSubmitting, status, touched }}
        />

      </Form>
    );
  }
}


export default CustomFieldForm;

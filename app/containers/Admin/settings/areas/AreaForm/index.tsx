import React from 'react';
import { isEmpty, values as getValues, every } from 'lodash';
import { Form, Field, InjectedFormikProps, FormikErrors } from 'formik';
import { FormattedMessage } from 'utils/cl-intl';
import { Multiloc } from 'typings';
import messages from '../messages';

import FormikInputMultiloc from 'components/UI/FormikInputMultiloc';
import FormikTextAreaMultiloc from 'components/UI/FormikTextAreaMultiloc';
import FormikSubmitWrapper from 'components/admin/FormikSubmitWrapper';

import { Section, SectionField } from 'components/admin/Section';
import Error from 'components/UI/Error';

export interface FormValues {
  title_multiloc: Multiloc;
  description_multiloc: Multiloc;
}

export interface Props {}

export default class AreaForm extends React.Component<InjectedFormikProps<Props, FormValues>> {

  public static validate = (values: FormValues): FormikErrors<FormValues> => {
    const errors: FormikErrors<FormValues> = {};

    if (every(getValues(values.title_multiloc), isEmpty)) {
      errors.title_multiloc = (errors.title_multiloc || []).concat({ error: 'blank' });
    }

    return errors;
  }

  render() {
    const { isSubmitting, errors, isValid, touched } = this.props;
    
    return (
      <Form>
        <Section>
          <SectionField>
            <Field
              name="title_multiloc"
              component={FormikInputMultiloc}
              label={<FormattedMessage {...messages.fieldTitle} />}
            /> 
            {touched.title_multiloc && <Error
              fieldName="title_multiloc"
              apiErrors={errors.title_multiloc}
            />}
          </SectionField>
          <SectionField>
            <Field
              name="description_multiloc"
              component={FormikTextAreaMultiloc}
              label={<FormattedMessage {...messages.fieldDescription} />}
            />
            {touched.description_multiloc && <Error
              fieldName="description_multiloc"
              apiErrors={errors.description_multiloc}
            />}
          </SectionField>
        </Section>

        <FormikSubmitWrapper
          {...{ isValid, isSubmitting, status, touched }}
        />

      </Form>
    );
  }
};
import React from 'react';
import { Form, Field, InjectedFormikProps } from 'formik';
import Error from 'components/UI/Error';
import FormikInputMultiloc from 'components/UI/FormikInputMultiloc';
import FormikTextAreaMultiloc from 'components/UI/FormikTextAreaMultiloc';
import FormikSubmitWrapper from 'components/admin/FormikSubmitWrapper';
import { Section, SectionField } from 'components/admin/Section';
import { Multiloc } from 'typings';
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';

export interface FormValues {
  title_multiloc: Multiloc;
  description_multiloc: Multiloc;
}

export interface Props {}

export default class AreaForm extends React.Component<InjectedFormikProps<Props, FormValues>> {
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
import React from 'react';
import { Form, Field, InjectedFormikProps } from 'formik';
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
    return (
      <Form>
        <Section>
        <SectionField>
            <Field
              name="title_multiloc"
              component={FormikInputMultiloc}
              label={<FormattedMessage {...messages} />}
            /> 
          </SectionField>
        </Section>
      </Form>
    );
  }
};
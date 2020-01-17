import React from 'react';
import { isEmpty, values as getValues, every } from 'lodash-es';

import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';

import { Form, Field, InjectedFormikProps, FormikErrors } from 'formik';
import FormikInputMultiloc from 'components/UI/FormikInputMultiloc';
import FormikSubmitWrapper from 'components/admin/FormikSubmitWrapper';

import { Section, SectionField } from 'components/admin/Section';
import Error from 'components/UI/Error';

// Typings
import { Multiloc } from 'typings';
import IconTooltip from 'components/UI/IconTooltip';

export interface Props { }
export interface FormValues {
  title_multiloc: Multiloc;
  description_multiloc: Multiloc;
}

export default class TopicForm extends React.Component<InjectedFormikProps<Props, FormValues>> {

  public static validate = (values: FormValues): FormikErrors<FormValues> => {
    const errors: FormikErrors<FormValues> = {};

    if (every(getValues(values.title_multiloc), isEmpty)) {
      errors.title_multiloc = [{ error: 'blank' }] as any;
    }
    return errors;
  }

  render() {
    const { isSubmitting, errors, isValid, touched, status } = this.props;

    return (
      <Form>
        <Section>
          <SectionField>
            <Field
              name="title_multiloc"
              component={FormikInputMultiloc}
              label={<FormattedMessage {...messages.fieldTitle} />}
              labelTooltip={<IconTooltip content={<FormattedMessage {...messages.fieldTitleTooltip} />} />}
            />
            {touched.title_multiloc && <Error
              fieldName="title_multiloc"
              apiErrors={errors.title_multiloc as any}
            />}
          </SectionField>
        </Section>

        <FormikSubmitWrapper
          {...{ isValid, isSubmitting, status, touched }}
        />

      </Form>
    );
  }
}

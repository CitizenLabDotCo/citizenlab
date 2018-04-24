import React from 'react';
import { isEmpty, values as getValues, every } from 'lodash';

import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';

import { Form, Field, InjectedFormikProps, FormikErrors } from 'formik';
import FormikInputMultiloc from 'components/UI/FormikInputMultiloc';
import FormikEditorMultiloc from 'components/UI/FormikEditorMultiloc';
import FormikSubmitWrapper from 'components/admin/FormikSubmitWrapper';

import { Section, SectionField } from 'components/admin/Section';
import Error from 'components/UI/Error';

// Typings
import { Multiloc } from 'typings';
export interface Props {}
export interface FormValues {
  title_multiloc: Multiloc;
  description_multiloc: Multiloc;
}

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
              component={FormikEditorMultiloc}
              id="project-description"
              name="description_multiloc"
              label={<FormattedMessage {...messages.fieldDescription} />}
              toolbarConfig={{
                options: ['inline', 'list', 'link', 'blockType'],
                inline: {
                  options: ['bold', 'italic'],
                },
                list: {
                  options: ['unordered', 'ordered'],
                },
                blockType: {
                  inDropdown: false,
                  options: ['Normal', 'H1'],
                  className: undefined,
                  component: undefined,
                  dropdownClassName: undefined,
                }
              }}
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
}

import * as React from 'react';
import { Form, FormikErrors, InjectedFormikProps, Field } from 'formik';
import { isEmpty } from 'lodash-es';
import { FormSection, FormSectionTitle, FormLabel } from './FormComponents';
import FormikInput from 'components/UI/FormikInput';

import messages from './messages';
import { SectionField } from 'components/admin/Section';
import FormikQuill from 'components/UI/QuillEditor/FormikQuill';

export interface FormValues {
  title: string;
  body: string;
}

interface Props {}

class InitiativeForm extends React.Component<InjectedFormikProps<Props, FormValues>> {
  public static validate = (values: FormValues): FormikErrors<FormValues> => {
    const errors: FormikErrors<FormValues> = {};

    if (isEmpty(values.title)) {
      errors.title = [{ error: 'blank' }] as any;
    }

    return errors;
  }

  renderFormikQuill = (props) => {
    return (
      <FormikQuill
        noVideos
        noAlign
        {...props}
      />
    );
  }

  render() {
    // const { isSubmitting, errors, isValid, touched } = this.props;

    return (
      <Form>
        <FormSection>
          <FormSectionTitle message={messages.formGeneralSectionTitle} />

          <SectionField>
            <FormLabel
              labelMessage={messages.titleLabel}
              subtextMessage={messages.titleLabelSubtext}
            >
              <Field
                name="title"
                component={FormikInput}
                required
              />
            </FormLabel>
          </SectionField>

          <SectionField>
            <FormLabel
              labelMessage={messages.descriptionLabel}
              subtextMessage={messages.descriptionLabelSubtext}
            >
              <Field
                name="description"
                render={this.renderFormikQuill}
                required
              />
            </FormLabel>
          </SectionField>
        </FormSection>
      </Form>
    );
  }
}

export default InitiativeForm;

// Libraries
import React from 'react';

// i18n
import FormattedMessage from 'utils/cl-intl/FormattedMessage';
import messages from './messages';

// Components
import { Form, Field, InjectedFormikProps } from 'formik';
import Error from 'components/UI/Error';
import { Section, SectionField } from 'components/admin/Section';
import FormikSubmitWrapper from 'components/admin/FormikSubmitWrapper';
import FormikTextAreaMultiloc from 'components/UI/FormikTextAreaMultiloc';
import FormikQuillMultiloc from 'components/QuillEditor/FormikQuillMultiloc';

// Typings
import { Multiloc } from 'typings';
export interface Props { }
export interface State { }
export interface Values {
  description_multiloc: Multiloc;
  description_preview_multiloc: Multiloc;
}

// Wrapping the editor with the styles from the page where it will be rendered should ensure that styling is consistent.

class DescriptionEditionForm extends React.Component<InjectedFormikProps<Props, Values>, State> {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const { errors, isValid, isSubmitting, touched, status } = this.props;

    return (
      <Form noValidate className="e2e-project-description-form">
        <Section>
          <SectionField>
            <Field
              name="description_preview_multiloc"
              component={FormikTextAreaMultiloc}
              id="description-preview"
              label={<FormattedMessage {...messages.descriptionPreviewLabel} />}
              rows={5}
              maxCharCount={280}
            />
            <Error fieldName="description_preview_multiloc" apiErrors={errors.description_preview_multiloc as any} />
          </SectionField>

          <SectionField>
            <Field
              component={FormikQuillMultiloc}
              inAdmin
              id="project-description"
              name="description_multiloc"
              label={<FormattedMessage {...messages.descriptionLabel} />}
            />
            <Error fieldName="description_multiloc" apiErrors={errors.description_multiloc as any} />
          </SectionField>
        </Section>

        <FormikSubmitWrapper
          {...{ isValid, isSubmitting, status, touched }}
          style="cl-blue"
          messages={{
            buttonSave: messages.saveButtonLabel,
            buttonError: messages.saveErrorLabel,
            buttonSuccess: messages.saveSuccessLabel,
            messageError: messages.saveErrorMessage,
            messageSuccess: messages.saveSuccessMessage,
          }}
        />
      </Form>
    );
  }
}

export default DescriptionEditionForm;

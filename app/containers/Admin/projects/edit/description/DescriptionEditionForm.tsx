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
import FormikEditorMultiloc from 'components/UI/FormikEditorMultiloc';

// Typings
import { Multiloc } from 'typings';
export interface Props {}
export interface State {}
export interface Values {
  description_multiloc: Multiloc;
  description_preview_multiloc: Multiloc;
}

class DescriptionEditionForm extends React.Component<InjectedFormikProps<Props, Values> , State> {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const { errors, isValid, isSubmitting, touched } = this.props;

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
            <Error fieldName="description_preview_multiloc" apiErrors={errors.description_preview_multiloc} />
          </SectionField>
          <SectionField>
            <Field
              component={FormikEditorMultiloc}
              id="project-description"
              name="description_multiloc"
              label={<FormattedMessage {...messages.descriptionLabel} />}
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
            <Error fieldName="description_multiloc" apiErrors={errors.description_multiloc} />
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

// Libraries
import React, { PureComponent } from 'react';

// i18n
import { injectIntl } from 'utils/cl-intl';
import messages from './messages';
import { InjectedIntlProps } from 'react-intl';

// Components
import { Form, Field, InjectedFormikProps } from 'formik';
import Error from 'components/UI/Error';
import { Section, SectionField } from 'components/admin/Section';
import FormikSubmitWrapper from 'components/admin/FormikSubmitWrapper';
import FormikTextAreaMultiloc from 'components/UI/FormikTextAreaMultiloc';
import FormikQuillMultiloc from 'components/UI/QuillEditor/FormikQuillMultiloc';

// Typings
import { Multiloc } from 'typings';

export interface Props { }

export interface Values {
  description_multiloc: Multiloc;
  description_preview_multiloc: Multiloc;
}

// Wrapping the editor with the styles from the page where it will be rendered should ensure that styling is consistent.

class DescriptionEditionForm extends PureComponent<InjectedFormikProps<Props & InjectedIntlProps, Values>> {
  render() {
    const { errors, isValid, isSubmitting, touched, status, intl: { formatMessage } } = this.props;

    return (
      <Form noValidate className="e2e-project-description-form">
        <Section>
          <SectionField>
            <Field
              name="description_preview_multiloc"
              component={FormikTextAreaMultiloc}
              id="description-preview"
              label={formatMessage(messages.descriptionPreviewLabel)}
              labelTooltipText={formatMessage(messages.descriptionPreviewTooltip)}
              rows={5}
              maxCharCount={280}
            />
            <Error fieldName="description_preview_multiloc" apiErrors={errors.description_preview_multiloc as any} />
          </SectionField>

          <SectionField>
            <Field
              component={FormikQuillMultiloc}
              id="project-description"
              name="description_multiloc"
              label={formatMessage(messages.descriptionLabel)}
              labelTooltipText={formatMessage(messages.descriptionTooltip)}
            />
            <Error fieldName="description_multiloc" apiErrors={errors.description_multiloc as any} />
          </SectionField>
        </Section>

        <FormikSubmitWrapper
          {...{ isValid, isSubmitting, status, touched }}
          buttonStyle="cl-blue"
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

export default injectIntl<Props>(DescriptionEditionForm);

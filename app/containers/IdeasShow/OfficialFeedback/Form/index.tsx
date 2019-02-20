import React, { Component } from 'react';
import { isEmpty, values as getValues, every } from 'lodash-es';

import { injectIntl } from 'utils/cl-intl';
import messages from '../../messages';

import { Form, Field, FormikErrors, FormikProps } from 'formik';
import FormikInputMultiloc from 'components/UI/FormikInputMultiloc';
import FormikSubmitWrapper from 'components/admin/FormikSubmitWrapper';

import { Section } from 'components/admin/Section';
import Error from 'components/UI/Error';

// Typings
import { Multiloc, Locale, MultilocFormValues } from 'typings';
import FormLocaleSwitcher from 'components/admin/FormLocaleSwitcher';
import FormikMentionsTextAreaMultiloc from 'components/UI/FormikMentionsTextAreaMultiloc';
import { InjectedIntlProps } from 'react-intl';
import { colors, fontSizes } from 'utils/styleUtils';
import styled from 'styled-components';

export interface Props {
  locales: Locale[];
}

export interface FormValues extends MultilocFormValues {
  author_multiloc: Multiloc;
  body_multiloc: Multiloc;
}

interface State {
  selectedLocale: Locale;
}

const StyledFormikSubmitWrapper = styled(FormikSubmitWrapper)`
  margin-bottom: 30px;
`;

class OfficialFeedbackForm extends Component<Props & InjectedIntlProps & FormikProps<FormValues>, State> {
  constructor(props: Props & InjectedIntlProps) {
    super(props as any);
    this.state = {
      selectedLocale: 'en',
    };
  }

  onLocaleChange = (locale: Locale) => () => {
    this.setState({ selectedLocale: locale });
  }

  renderFormikInputMultiloc = (props) => (
    <FormikInputMultiloc
      shownLocale={this.state.selectedLocale}
      placeholder={this.props.intl.formatMessage(messages.officialNamePlaceholder)}
      {...props}
    />
  )

  renderFormikMentionsTextAreaMultiloc = (props) => (
    <FormikMentionsTextAreaMultiloc
      shownLocale={this.state.selectedLocale}
      placeholder={this.props.intl.formatMessage(messages.officialFeedbackPlaceholder)}
      rows={8}
      padding="12px"
      fontSize={fontSizes.base}
      {...props}
    />
  )

  render() {
    const { isSubmitting, errors, isValid, touched, values } = this.props;
    const { selectedLocale } = this.state;

    return (
      <Form>
        <Section>
          <FormLocaleSwitcher
            onLocaleChange={this.onLocaleChange}
            selectedLocale={selectedLocale}
            values={values}
          />
          <Field
            name="author_multiloc"
            render={this.renderFormikInputMultiloc}
          />
          {touched.author_multiloc && <Error
            fieldName="author_multiloc"
            marginBottom="20px"
            apiErrors={errors.author_multiloc as any}
          />}

          <Field
            render={this.renderFormikMentionsTextAreaMultiloc}
            name="body_multiloc"
          />
          {touched.body_multiloc && <Error
            fieldName="body_multiloc"
            marginBottom="20px"
            apiErrors={errors.body_multiloc as any}
          />}
        </Section>

        <StyledFormikSubmitWrapper
          bgColor={colors.clRed}
          icon="pen"
          textColor="white"
          fullWidth
          messages={{
            buttonSave: messages.updateButtonSave,
            buttonError: messages.updateButtonError,
            buttonSuccess: messages.updateButtonSuccess,
            messageError: messages.updateMessageError,
            messageSuccess: messages.updateMessaageSuccess
          }}
          {...{ isValid, isSubmitting, status, touched }}
        />

      </Form>
    );
  }
}

const OfficialFeedbackFormWithIntl = injectIntl(OfficialFeedbackForm);
class OfficialFeedbackFormWithHoCs extends Component<Props & FormikProps<FormValues>> {
  public static validate = (values: FormValues): FormikErrors<FormValues> => {
    const errors: FormikErrors<FormValues> = {};

    if (every(getValues(values.author_multiloc), isEmpty)) {
      errors.author_multiloc = [{ error: 'blank' }] as any;
    }
    if (every(getValues(values.body_multiloc), isEmpty)) {
      errors.body_multiloc = [{ error: 'blank' }] as any;
    }
    return errors;
  }

  render() {
    return <OfficialFeedbackFormWithIntl {...this.props} />;
  }
}

export default OfficialFeedbackFormWithHoCs;

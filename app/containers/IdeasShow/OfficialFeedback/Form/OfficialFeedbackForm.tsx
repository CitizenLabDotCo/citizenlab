// libraries
import React, { Component } from 'react';
import { isEmpty, values as getValues, every } from 'lodash-es';

// intl
import { injectIntl, FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';
import { InjectedIntlProps } from 'react-intl';

// components
import { Form, Field, FormikErrors, FormikProps } from 'formik';
import FormikInputMultiloc from 'components/UI/FormikInputMultiloc';
import FormikSubmitWrapper from 'components/admin/FormikSubmitWrapper';
import FormLocaleSwitcher from 'components/admin/FormLocaleSwitcher';
import FormikMentionsTextAreaMultiloc from 'components/UI/FormikMentionsTextAreaMultiloc';
import { Section } from 'components/admin/Section';
import Error from 'components/UI/Error';

// Typings
import { Multiloc, Locale, MultilocFormValues } from 'typings';

// stylings
import { colors, fontSizes } from 'utils/styleUtils';
import styled from 'styled-components';
import Button from 'components/UI/Button';

const ButtonContainer = styled.div`
  display: flex;
  >:not(:last-child) {
    margin-right: 5px;
  }
`;

export interface Props {
  locales: Locale[];
  onCancel?: () => void;
}

export interface FormValues extends MultilocFormValues {
  author_multiloc: Multiloc;
  body_multiloc: Multiloc;
}

interface State {
  selectedLocale: Locale;
}

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
      backgroundColor="#FFF"
      placeholderFontWeight="500"
      {...props}
    />
  )

  render() {
    const { isSubmitting, errors, isValid, touched, values, onCancel } = this.props;
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
            render={this.renderFormikMentionsTextAreaMultiloc}
            name="body_multiloc"
          />
          {touched.body_multiloc && <Error
            fieldName="body_multiloc"
            marginBottom="20px"
            apiErrors={errors.body_multiloc as any}
          />}

          <Field
            name="author_multiloc"
            render={this.renderFormikInputMultiloc}
          />
          {touched.author_multiloc && <Error
            fieldName="author_multiloc"
            marginBottom="20px"
            apiErrors={errors.author_multiloc as any}
          />}
        </Section>

        <ButtonContainer>
          <FormikSubmitWrapper
            bgColor={colors.clRed}
            icon="pen"
            textColor="white"
            fullWidth
            messages={{
              buttonSave: messages.updateButtonSave,
              buttonError: messages.updateButtonError,
              buttonSuccess: messages.updateButtonSuccess,
              messageError: messages.updateMessageError,
              messageSuccess: messages.updateMessageSuccess
            }}
            {...{ isValid, isSubmitting, status, touched }}
          />
          {onCancel &&
            <Button onClick={onCancel} bgColor="white" textColor={colors.clRed}>
              <FormattedMessage {...messages.cancel} />
            </Button>
          }
        </ButtonContainer>

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

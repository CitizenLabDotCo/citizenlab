// libraries
import React, { Component } from 'react';
import { isEmpty, uniq } from 'lodash-es';
import { adopt } from 'react-adopt';

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
import Button from 'components/UI/Button';

// Typings
import { Multiloc, Locale, MultilocFormValues } from 'typings';

// stylings
import { colors, fontSizes } from 'utils/styleUtils';
import styled from 'styled-components';

// resources
import GetLocale, { GetLocaleChildProps } from 'resources/GetLocale';

const ButtonContainer = styled.div`
  >:not(:last-child) {
    margin-right: 5px;
  }
`;

const CancelButton = styled(Button)`
  margin-top: 10px;
`;

interface DataProps {
  locale: GetLocaleChildProps;
}

interface InputProps {
  onCancel?: () => void;
  editForm?: boolean;
}

export interface Props extends DataProps, InputProps {}

export interface FormValues extends MultilocFormValues {
  author_multiloc: Multiloc;
  body_multiloc: Multiloc;
}

interface State {
  selectedLocale: GetLocaleChildProps;
}

class OfficialFeedbackForm extends Component<Props & InjectedIntlProps & FormikProps<FormValues>, State> {
  constructor(props: Props & InjectedIntlProps) {
    super(props as any);
    this.state = {
      selectedLocale: props.locale,
    };
  }

  onLocaleChange = (locale: Locale) => () => {
    this.setState({ selectedLocale: locale });
  }

  renderFormikInputMultiloc = (props) => (
    <FormikInputMultiloc
      shownLocale={this.state.selectedLocale}
      placeholder={this.props.intl.formatMessage(messages.officialNamePlaceholder)}
      ariaLabel={this.props.intl.formatMessage(messages.officialUpdateAuthor)}
      {...props}
    />
  )

  renderFormikMentionsTextAreaMultiloc = (props) => (
    <FormikMentionsTextAreaMultiloc
      shownLocale={this.state.selectedLocale}
      placeholder={this.props.intl.formatMessage(messages.textAreaPlaceholder)}
      rows={8}
      padding="12px"
      fontSize={fontSizes.base}
      backgroundColor="#FFF"
      placeholderFontWeight="400"
      ariaLabel={this.props.intl.formatMessage(messages.officialUpdateBody)}
      {...props}
    />
  )

  render() {
    const { isSubmitting, isValid, touched, values, onCancel, editForm, status } = this.props;
    const { selectedLocale } = this.state;

    if (!selectedLocale) return null;

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

          <Field
            name="author_multiloc"
            render={this.renderFormikInputMultiloc}
          />
        </Section>

        <ButtonContainer>
          <FormikSubmitWrapper
            animate
            bgColor={editForm ? colors.adminTextColor : colors.clRed}
            icon="pen"
            textColor="white"
            fullWidth
            messages={{
              buttonSave: editForm ? messages.updateButtonSaveEditForm : messages.publishButtonText,
              buttonError: messages.updateButtonError,
              buttonSuccess: messages.updateButtonSuccess,
              messageError: messages.updateMessageError,
              messageSuccess: messages.updateMessageSuccess
            }}
            {...{ isValid, isSubmitting, status, touched }}
          />
          {onCancel &&
            <CancelButton style="text" onClick={onCancel} textColor={editForm ? colors.adminTextColor : colors.clRed}>
              <FormattedMessage {...messages.cancel} />
            </CancelButton>
          }
        </ButtonContainer>

      </Form>
    );
  }
}

const OfficialFeedbackFormWithIntl = injectIntl<Props>(OfficialFeedbackForm);

const Data = adopt<DataProps, InputProps>({
  locale: <GetLocale />
});

export default class OfficialFeedbackFormWithHoCs extends Component<Props & FormikProps<FormValues>> {
  public static validate = (values: FormValues): FormikErrors<FormValues> => {
    const errors: FormikErrors<FormValues> = {};

    // Get array of locales that has an author and/or body content based on the combined keys of both the author and body objects
    const locales: string[] = uniq([...Object.keys(values.author_multiloc), ...Object.keys(values.body_multiloc)]);

    // First loop over both the author and body content values for each locale
    // and determine whether or not one of them is empty while the other is not.
    // If that's the case, set the error for the value (author or body) that's empty.
    locales.forEach((locale) => {
      if ((isEmpty(values.author_multiloc[locale]) && !isEmpty(values.body_multiloc[locale])) || (!isEmpty(values.author_multiloc[locale]) && isEmpty(values.body_multiloc[locale]))) {
        if (isEmpty(values.author_multiloc[locale])) {
          errors.author_multiloc = [{ error: 'blank' }] as any;
        }

        if (isEmpty(values.body_multiloc[locale])) {
          errors.body_multiloc = [{ error: 'blank' }] as any;
        }
      }
    });

    // If the errors object is still empty after the previous loop do a secondary check
    // to see if there is at least one locale that has both author and body text.
    if (isEmpty(errors)) {
      let hasOneOrMoreValidatedLocales = false;

      locales.forEach((locale) => {
        if (!isEmpty(values.author_multiloc[locale]) && !isEmpty(values.body_multiloc[locale])) {
          hasOneOrMoreValidatedLocales = true;
        }
      });

      // If there are no valid locales, than loop through them again and set error where the value is empty
      if (!hasOneOrMoreValidatedLocales) {
        locales.forEach((locale) => {
          if (isEmpty(values.author_multiloc[locale])) {
            errors.author_multiloc = [{ error: 'blank' }] as any;
          }

          if (isEmpty(values.body_multiloc[locale])) {
            errors.body_multiloc = [{ error: 'blank' }] as any;
          }
        });
      }
    }

    return errors;
  }

  render() {
    return (
      <Data {...this.props}>
        {dataProps => <OfficialFeedbackFormWithIntl {...this.props} {...dataProps} />}
      </Data>
    );
  }
}

export const formatMentionsBodyMultiloc = (bodyMultiloc: Multiloc): Multiloc => {
  const formattedMentionsBodyMultiloc = {};

  for (const locale in bodyMultiloc) {
    const bodyText = bodyMultiloc[locale];
    formattedMentionsBodyMultiloc[locale] = bodyText.replace(/\@\[(.*?)\]\((.*?)\)/gi, '@$2');
  }

  return formattedMentionsBodyMultiloc;
};

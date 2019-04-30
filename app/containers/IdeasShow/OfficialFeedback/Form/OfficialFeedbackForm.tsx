// libraries
import React, { Component } from 'react';
import { values as getValues, every } from 'lodash-es';
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

// utils
import { isNonEmptyString } from 'utils/helperUtils';

// resources
import GetLocale, { GetLocaleChildProps } from 'resources/GetLocale';
import GetTenantLocales, { GetTenantLocalesChildProps } from 'resources/GetTenantLocales';

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
  tenantLocales: GetTenantLocalesChildProps;
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
  public static validate = (values: FormValues): FormikErrors<FormValues> => {
    const errors: FormikErrors<FormValues> = {};

    if (!every(getValues(values.author_multiloc), isNonEmptyString)) {
      errors.author_multiloc = [{ error: 'blank' }] as any;
    }
    if (!every(getValues(values.body_multiloc), isNonEmptyString)) {
      errors.body_multiloc = [{ error: 'blank' }] as any;
    }

    return errors;
  }

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
      placeholder={this.props.intl.formatMessage(messages.officialFeedbackPlaceholder)}
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
              buttonSave: editForm ? messages.updateButtonSaveEditForm : messages.updateButtonSave,
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
  tenantLocales: <GetTenantLocales />,
  locale: <GetLocale />
});

export default class OfficialFeedbackFormWithHoCs extends Component<Props & FormikProps<FormValues>> {
  public static validate = (values: FormValues): FormikErrors<FormValues> => {
    let errors: FormikErrors<FormValues> = {};
    const bodyMultilocValues = getValues(values.body_multiloc);
    const authorMultilocValues = getValues(values.author_multiloc);

    // values
    // values.body_multiloc & values.author_multiloc
    // if they haven't been touched in at least one language, their value is an {}
    // once you type in them, their values become strings (for the selected locale)
    // we only want to enable the Give an update button only when there's a (non-empty) body and author multiloc for the same language
    // if values.body_multiloc has no language keys or language key but string is empty => error = blank
    // if values.author_multiloc has no language keys or language key but string is empty => error = blank
    // if values.body_multiloc has val

    // grab locales of body_multiloc, then check if there's at least one matching locale in author_multiloc that has a non-empty string value
    // const localesWithBodyContent = Object.keys(values.body_multiloc);
    let validOfficialFeedbacks = 0;
    for (const locale of localesWithBodyContent) {
      if (!isNonEmptyString(values.body_multiloc[locale]) && !isNonEmptyString(values.author_multiloc[locale])) {
        validOfficialFeedbacks += 1;
      }
    }

    if (validOfficialFeedbacks > 0) {
      errors = {};
    }

    // if (!every(bodyMultilocValues, isNonEmptyString) || bodyMultilocValues.length === 0) {
    //   errors.body_multiloc = [{ error: 'blank' }] as any;
    // }
    // if (!every(authorMultilocValues, isNonEmptyString) || authorMultilocValues.length === 0) {
    //   errors.author_multiloc = [{ error: 'blank' }] as any;
    // }

    if (bodyMultilocValues.length === 0) {
      errors.body_multiloc = [{ error: 'blank' }] as any;
    }

    if (authorMultilocValues.length === 0) {
      errors.author_multiloc = [{ error: 'blank' }] as any;
    }

    const localesWithBodyContent = Object.keys(values.body_multiloc);
    for (const locale of localesWithBodyContent) {
      if (!isNonEmptyString(values.body_multiloc[locale]) && isNonEmptyString(values.author_multiloc[locale])) {
        errors.author_multiloc = [{ error: 'blank' }] as any;
      }
    }

    const localesWithAuthorContent = Object.keys(values.body_multiloc);
    for (const locale of localesWithAuthorContent) {
      if (!isNonEmptyString(values.body_multiloc[locale]) && !isNonEmptyString(values.author_multiloc[locale])) {
        validOfficialFeedbacks += 1;
      }
    }

    console.log(errors);

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

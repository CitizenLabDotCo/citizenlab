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

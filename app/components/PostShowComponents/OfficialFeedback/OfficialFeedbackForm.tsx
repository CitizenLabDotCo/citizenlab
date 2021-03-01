// libraries
import React, { PureComponent } from 'react';
import { forOwn, isEmpty } from 'lodash-es';

// components
import { Input, LocaleSwitcher } from 'cl2-component-library';
import MentionsTextArea from 'components/UI/MentionsTextArea';
import { Section } from 'components/admin/Section';
import Error from 'components/UI/Error';
import Button from 'components/UI/Button';

// services
import {
  addOfficialFeedbackToIdea,
  addOfficialFeedbackToInitiative,
  updateOfficialFeedback,
  IOfficialFeedbackData,
} from 'services/officialFeedback';

// utils
import { isPage, isNilOrError } from 'utils/helperUtils';

// i18n
import { injectIntl, FormattedMessage } from 'utils/cl-intl';
import messages from './messages';
import { InjectedIntlProps } from 'react-intl';

// tracking
import { trackEventByName } from 'utils/analytics';
import tracks from './tracks';

// typings
import { Multiloc, Locale } from 'typings';

// stylings
import { colors, fontSizes } from 'utils/styleUtils';
import styled from 'styled-components';

const Container = styled.div``;

const FormLabel = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 15px;
`;

const AddOfficialUpdateTitle = styled.h2`
  color: ${({ theme }) => theme.colorText};
  font-size: ${fontSizes.medium}px;
  line-height: normal;
  font-weight: 600;
  padding: 0;
  margin: 0;
`;

const StyledLocaleSwitcher = styled(LocaleSwitcher)`
  width: auto;
  flex: 1;
`;

const StyledMentionsTextArea = styled(MentionsTextArea)`
  margin-bottom: 12px;
`;

const StyledInput = styled(Input)`
  margin-bottom: 12px;
`;

const StyledError = styled(Error)`
  margin-bottom: 12px;
`;

const SuccessMessage = styled.div`
  font-size: ${fontSizes.base}px;
  color: ${colors.clGreenSuccess};
  font-weight: 400;
  line-height: normal;
  margin-left: 14px;
`;

const ButtonContainer = styled.div`
  display: flex;
`;

const SubmitButton = styled(Button)``;

const CancelButton = styled(Button)`
  margin-left: 10px;
`;

export interface OfficialFeedbackFormValues {
  bodyMultiloc: Multiloc;
  authorMultiloc: Multiloc;
}

interface Props {
  locale: Locale;
  tenantLocales: Locale[];
  postId?: string;
  postType?: 'idea' | 'initiative';
  formType: 'new' | 'edit';
  feedback?: IOfficialFeedbackData;
  className?: string;
  onClose?: () => void;
}

interface State {
  selectedLocale: Locale | null;
  formValues: OfficialFeedbackFormValues;
  processing?: boolean;
  error: boolean;
  success: boolean;
}

class OfficialFeedbackForm extends PureComponent<
  Props & InjectedIntlProps,
  State
> {
  constructor(props) {
    super(props);
    this.state = {
      selectedLocale: null,
      formValues: {
        authorMultiloc: {},
        bodyMultiloc: {},
      },
      processing: false,
      error: false,
      success: false,
    };
  }

  componentDidMount() {
    const { locale, formType } = this.props;

    this.setState({
      selectedLocale: locale,
      formValues:
        formType === 'new'
          ? this.getEmptyFormValues()
          : this.getPreviouslySavedFormValues(),
    });
  }

  getEmptyFormValues = () => {
    const formValues = {
      bodyMultiloc: {},
      authorMultiloc: {},
    };

    this.props.tenantLocales.forEach((locale) => {
      formValues.bodyMultiloc[locale] = '';
      formValues.authorMultiloc[locale] = '';
    });

    return formValues;
  };

  getPreviouslySavedFormValues = () => {
    const { feedback } = this.props;

    const formValues = {
      authorMultiloc: (feedback as IOfficialFeedbackData).attributes
        .author_multiloc,
      bodyMultiloc: {},
    };

    forOwn(
      (feedback as IOfficialFeedbackData).attributes.body_multiloc,
      (bodyText, locale) => {
        formValues.bodyMultiloc[locale] = (bodyText || '').replace(
          /<span\sclass="cl-mention-user"[\S\s]*?data-user-id="([\S\s]*?)"[\S\s]*?data-user-slug="([\S\s]*?)"[\S\s]*?>@([\S\s]*?)<\/span>/gi,
          '@[$3]($2)'
        );
      }
    );

    return formValues;
  };

  handleOnLocaleChange = (locale: Locale) => {
    this.setState({ selectedLocale: locale });
  };

  handleBodyOnChange = (body: string, locale: Locale | undefined) => {
    if (locale) {
      this.setState((state) => ({
        error: false,
        success: false,
        formValues: {
          ...state.formValues,
          bodyMultiloc: {
            ...state.formValues.bodyMultiloc,
            [locale]: body,
          },
        },
      }));
    }
  };

  handleAuthorOnChange = (author: string, locale: Locale | undefined) => {
    if (locale) {
      this.setState((state) => ({
        error: false,
        success: false,
        formValues: {
          ...state.formValues,
          authorMultiloc: {
            ...state.formValues.authorMultiloc,
            [locale]: author,
          },
        },
      }));
    }
  };

  validate = () => {
    const { tenantLocales } = this.props;
    const { formValues } = this.state;

    let validated = false;

    tenantLocales.forEach((locale) => {
      if (
        !isEmpty(formValues.authorMultiloc[locale]) &&
        !isEmpty(formValues.bodyMultiloc[locale])
      ) {
        validated = true;
      }
    });

    tenantLocales.forEach((locale) => {
      if (
        (!isEmpty(formValues.authorMultiloc[locale]) &&
          isEmpty(formValues.bodyMultiloc[locale])) ||
        (isEmpty(formValues.authorMultiloc[locale]) &&
          !isEmpty(formValues.bodyMultiloc[locale]))
      ) {
        validated = false;
      }
    });

    return validated;
  };

  handleOnSubmit = async (event: React.FormEvent) => {
    const { postId, postType, formType, feedback, onClose } = this.props;
    const { formValues, processing } = this.state;

    event.preventDefault();

    if (!processing && this.validate()) {
      this.setState({
        processing: true,
        error: false,
        success: false,
      });

      const feedbackValues = {
        author_multiloc: formValues.authorMultiloc,
        body_multiloc: {} as Multiloc,
      };

      forOwn(formValues.bodyMultiloc, (bodyText, locale) => {
        feedbackValues.body_multiloc[locale] = (bodyText || '').replace(
          /\@\[(.*?)\]\((.*?)\)/gi,
          '@$2'
        );
      });

      try {
        if (formType === 'new' && postId && postType === 'idea') {
          await addOfficialFeedbackToIdea(postId, feedbackValues);
          trackEventByName(tracks.officialFeedbackGiven, {
            location: isPage('admin', location.pathname)
              ? 'Admin/idea manager'
              : 'Citizen/idea page',
          });
        }

        if (formType === 'new' && postId && postType === 'initiative') {
          await addOfficialFeedbackToInitiative(postId, feedbackValues);
          trackEventByName(tracks.officialFeedbackGiven, {
            location: isPage('admin', location.pathname)
              ? 'Admin/initiative manager'
              : 'Citizen/initiative page',
          });
        }

        if (formType === 'edit' && !isNilOrError(feedback) && onClose) {
          await updateOfficialFeedback(feedback.id, feedbackValues);
          onClose();
        }

        this.setState({
          formValues: this.getEmptyFormValues(),
          processing: false,
          success: true,
        });

        setTimeout(() => this.setState({ success: false }), 6000);
      } catch {
        this.setState({
          processing: false,
          error: true,
          success: false,
        });
      }
    }
  };

  render() {
    const {
      formType,
      onClose,
      className,
      tenantLocales,
      intl: { formatMessage },
    } = this.props;
    const {
      selectedLocale,
      formValues,
      processing,
      error,
      success,
    } = this.state;
    const errorMessage = error
      ? formatMessage(messages.updateButtonError)
      : null;
    const successMessage = success
      ? formatMessage(messages.updateMessageSuccess)
      : null;

    if (selectedLocale) {
      return (
        <Container className={className || ''}>
          <Section id="official-feedback-form">
            <FormLabel>
              {formType === 'new' && (
                <AddOfficialUpdateTitle>
                  <FormattedMessage {...messages.addOfficalUpdate} />
                </AddOfficialUpdateTitle>
              )}

              <StyledLocaleSwitcher
                locales={tenantLocales}
                selectedLocale={selectedLocale}
                onSelectedLocaleChange={this.handleOnLocaleChange}
                values={formValues as any}
              />
            </FormLabel>

            <StyledMentionsTextArea
              name="official-feedback-form-mentions-textarea"
              locale={selectedLocale}
              ariaLabel={formatMessage(messages.officialUpdateBody)}
              value={formValues.bodyMultiloc?.[selectedLocale] || ''}
              onChange={this.handleBodyOnChange}
              placeholder={formatMessage(messages.textAreaPlaceholder)}
              rows={8}
              padding="12px"
              fontSize={`${fontSizes.base}px`}
              background="#fff"
            />

            <StyledInput
              type="text"
              locale={selectedLocale}
              value={formValues.authorMultiloc?.[selectedLocale] || ''}
              onChange={this.handleAuthorOnChange}
              placeholder={formatMessage(messages.officialNamePlaceholder)}
              ariaLabel={formatMessage(messages.officialUpdateAuthor)}
            />
          </Section>

          <StyledError text={errorMessage} marginTop="0px" />

          <ButtonContainer>
            <SubmitButton
              className="e2e-official-feedback-form-submit-button"
              bgColor={
                formType === 'edit' ? colors.adminTextColor : colors.clRed
              }
              icon="pen"
              textColor="white"
              fullWidth={formType === 'new'}
              onClick={this.handleOnSubmit}
              disabled={!this.validate()}
              processing={processing}
            >
              {formType === 'edit' ? (
                <FormattedMessage {...messages.updateButtonSaveEditForm} />
              ) : (
                <FormattedMessage {...messages.publishButtonText} />
              )}
            </SubmitButton>

            {successMessage && (
              <SuccessMessage>{successMessage}</SuccessMessage>
            )}

            {onClose && (
              <CancelButton
                buttonStyle="secondary"
                onClick={onClose}
                textColor={
                  formType === 'edit' ? colors.adminTextColor : colors.clRed
                }
              >
                <FormattedMessage {...messages.cancel} />
              </CancelButton>
            )}
          </ButtonContainer>
        </Container>
      );
    }

    return null;
  }
}

export default injectIntl<Props>(OfficialFeedbackForm);

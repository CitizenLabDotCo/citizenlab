// libraries
import React, { Component } from 'react';
import { map } from 'lodash-es';

// intl
import { injectIntl, FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';
import { InjectedIntlProps } from 'react-intl';

// components
import Input from 'components/UI/Input';
import FormLocaleSwitcher from 'components/admin/FormLocaleSwitcher';
import MentionsTextArea from 'components/UI/MentionsTextArea';
import { Section } from 'components/admin/Section';
import Button from 'components/UI/Button';

// services
import { addOfficialFeedbackToIdea, addOfficialFeedbackToInitiative, updateOfficialFeedback, IOfficialFeedbackData } from 'services/officialFeedback';

// utils
import { isPage, isNilOrError } from 'utils/helperUtils';
import { isCLErrorJSON } from 'utils/errorUtils';

// tracking
import { trackEventByName } from 'utils/analytics';
import tracks from '../tracks';

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
  color: ${colors.text};
  font-size: ${fontSizes.medium}px;
  line-height: normal;
  font-weight: 600;
  padding: 0;
  margin: 0;
`;

const StyledFormLocaleSwitcher = styled(FormLocaleSwitcher)`
  width: auto;
  flex: 1;
`;

const ButtonContainer = styled.div`
  >:not(:last-child) {
    margin-right: 5px;
  }
`;

const SubmitButton = styled(Button)``;

const CancelButton = styled(Button)`
  margin-top: 10px;
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
}

class OfficialFeedbackForm extends Component<Props & InjectedIntlProps, State> {

  constructor(props: Props & InjectedIntlProps) {
    super(props);
    this.state = {
      selectedLocale: null,
      formValues: {
        authorMultiloc: {},
        bodyMultiloc: {}
      },
      processing: false
    };
  }

  componentDidMount() {
    const { locale, formType, feedback } = this.props;

    this.setState({
      selectedLocale: locale,
      formValues: formType === 'new' ? this.resetFormValues() : {
        authorMultiloc: (feedback as IOfficialFeedbackData).attributes.author_multiloc,
        bodyMultiloc: (feedback as IOfficialFeedbackData).attributes.body_multiloc
      }
    });
  }

  resetFormValues = () => {
    const formValues = {
      bodyMultiloc: {},
      authorMultiloc: {}
    };

    this.props.tenantLocales.forEach((locale) => {
      formValues.bodyMultiloc[locale] = '';
      formValues.authorMultiloc[locale] = '';
    });

    return formValues;
  }

  handleOnLocaleChange = (locale: Locale) => {
    this.setState({ selectedLocale: locale });
  }

  handleBodyOnChange = (body: string, locale: Locale | undefined) => {
    if (locale) {
      this.setState((state) => ({
        formValues: {
          ...state.formValues,
          bodyMultiloc: {
            ...state.formValues.bodyMultiloc,
            [locale]: body
          }
        }
      }));
    }
  }

  handleAuthorOnChange = (author: string, locale: Locale | undefined) => {
    if (locale) {
      this.setState((state) => ({
        formValues: {
          ...state.formValues,
          authorMultiloc: {
            ...state.formValues.authorMultiloc,
            [locale]: author
          }
        }
      }));
    }
  }

  handleOnSubmit = async (formValues: OfficialFeedbackFormValues) => {
    const { postId, postType, formType, feedback, onClose } = this.props;

    this.setState({ processing: true });

    const feedbackValues = {
      author_multiloc: formValues.authorMultiloc,
      body_multiloc: map(formValues.bodyMultiloc, (bodyText) => (bodyText || '').replace(/\@\[(.*?)\]\((.*?)\)/gi, '@$2')) as Multiloc
    };

    try {
      if (formType === 'new' && postId && postType === 'idea') {
        await addOfficialFeedbackToIdea(postId, feedbackValues);
        trackEventByName(tracks.officialFeedbackGiven, { location: isPage('admin', location.pathname) ? 'Admin/idea manager' : 'Citizen/idea page' });
      }

      if (formType === 'new' && postId && postType === 'initiative') {
        await addOfficialFeedbackToInitiative(postId, feedbackValues);
        trackEventByName(tracks.officialFeedbackGiven, { location: isPage('admin', location.pathname) ? 'Admin/initiative manager' : 'Citizen/initiative page' });
      }

      if (formType === 'edit' && !isNilOrError(feedback) && onClose) {
        await updateOfficialFeedback(feedback.id, feedbackValues);
        onClose();
      }

      this.setState({
        processing: false,
        formValues: this.resetFormValues()
      });

      // setStatus('success');
    } catch (errorResponse) {
      // if (isCLErrorJSON(errorResponse)) {
      //   const apiErrors = (errorResponse as CLErrorsJSON).json.errors;
      //   setErrors(apiErrors);
      // } else {
      //   setStatus('error');
      // }

      this.setState({ processing: false });
    }
  }

  render() {
    const { formType, onClose, className, tenantLocales } = this.props;
    const { selectedLocale, formValues, processing } = this.state;

    if (!isNilOrError(tenantLocales) && selectedLocale) {
      return (
        <Container className={className || ''}>
          <Section id="official-feedback-form">
            <FormLabel>
              {formType === 'new' &&
                <AddOfficialUpdateTitle>
                  <FormattedMessage {...messages.addOfficalUpdate} />
                </AddOfficialUpdateTitle>
              }

              <StyledFormLocaleSwitcher
                locales={tenantLocales}
                selectedLocale={selectedLocale}
                onLocaleChange={this.handleOnLocaleChange}
                values={formValues as any}
              />
            </FormLabel>

            <MentionsTextArea
              name="official-feedback-form-mentions-textarea"
              locale={selectedLocale}
              value={formValues.bodyMultiloc?.[selectedLocale] || ''}
              onChange={this.handleBodyOnChange}
              placeholder={this.props.intl.formatMessage(messages.textAreaPlaceholder)}
              rows={8}
              padding="12px"
              fontSize={`${fontSizes.base}px`}
              background="#fff"
              placeholderFontWeight="400"
              ariaLabel={this.props.intl.formatMessage(messages.officialUpdateBody)}
            />

            <Input
              type="text"
              locale={selectedLocale}
              value={formValues.authorMultiloc?.[selectedLocale] || ''}
              onChange={this.handleAuthorOnChange}
              placeholder={this.props.intl.formatMessage(messages.officialNamePlaceholder)}
              ariaLabel={this.props.intl.formatMessage(messages.officialUpdateAuthor)}
            />
          </Section>

          <ButtonContainer>
            <SubmitButton
              bgColor={formType === 'edit' ? colors.adminTextColor : colors.clRed}
              icon="pen"
              textColor="white"
              fullWidth={true}
              processing={processing}
            >
              {formType === 'edit' ? <FormattedMessage {...messages.updateButtonSaveEditForm} /> : <FormattedMessage {...messages.publishButtonText} />}
            </SubmitButton>

            {onClose &&
              <CancelButton
                buttonStyle="text"
                onClick={onClose}
                textColor={formType === 'edit' ? colors.adminTextColor : colors.clRed}
              >
                <FormattedMessage {...messages.cancel} />
              </CancelButton>
            }
          </ButtonContainer>
        </Container>
      );
    }

    return null;
  }
}

export default injectIntl<Props>(OfficialFeedbackForm);

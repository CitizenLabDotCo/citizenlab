import React, { PureComponent } from 'react';

// Styling
import styled from 'styled-components';
import { colors } from 'utils/styleUtils';

// resources
import { IOfficialFeedbackData } from 'services/officialFeedback';

// intl
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from '../../messages';

// components
import OfficialFeedbackPost from 'components/PostShowComponents/OfficialFeedback/OfficialFeedbackPost';
import Radio from 'components/UI/Radio';
import { Section } from 'components/admin/Section';
import FormLocaleSwitcher from 'components/admin/FormLocaleSwitcher';
import MentionsTextArea from 'components/UI/MentionsTextArea';
import { Input } from 'cl2-component-library';
import Error from 'components/UI/Error';
import Button from 'components/UI/Button';

// Typings
import { Multiloc, Locale, MultilocFormValues } from 'typings';

const StyledSection = styled(Section)``;

const StyledFormLocaleSwitcher = styled(FormLocaleSwitcher)`
  margin: 10px 0;
`;

const StyledMentionsTextArea = styled(MentionsTextArea)`
  margin-bottom: 15px;
`;

const StyledInput = styled(Input)``;

const StyledRadio = styled(Radio)`
  margin-top: 25px;
`;

const ChangeStatusButton = styled(Button)`
  margin-top: 25px;
`;

export interface FormValues extends MultilocFormValues {
  author_multiloc: Multiloc;
  body_multiloc: Multiloc;
}

interface Props {
  loading: boolean;
  error: boolean;
  newOfficialFeedback: FormValues;
  mode: 'latest' | 'new';
  latestOfficialFeedback: IOfficialFeedbackData | null;
  onChangeMode: (value) => void;
  onChangeBody: (value: Multiloc) => void;
  onChangeAuthor: (value: Multiloc) => void;
  submit: () => void;
  valid: boolean;
}

interface State {
  selectedLocale: Locale;
}

class StatusChangeForm extends PureComponent<Props & InjectedIntlProps, State> {
  constructor(props: Props & InjectedIntlProps) {
    super(props);
    this.state = {
      selectedLocale: props.intl.locale as Locale
    };
  }

  renderFullForm = () => {
    const { latestOfficialFeedback, mode, onChangeMode, intl: { formatMessage } } = this.props;

    if (!latestOfficialFeedback) return null;

    return (
      <>
        <StyledRadio
          onChange={onChangeMode}
          currentValue={mode}
          value="new"
          name="statusChangeMethod"
          label={formatMessage(messages.newFeedbackMode)}
        />

        {mode === 'new' &&
          this.renderFeedbackForm()
        }

        <StyledRadio
          onChange={onChangeMode}
          currentValue={mode}
          value="latest"
          name="statusChangeMethod"
          label={formatMessage(messages.latestFeedbackMode)}
        />

        {mode === 'latest' &&
          <OfficialFeedbackPost
            editingAllowed={false}
            officialFeedbackPost={latestOfficialFeedback}
            postType="initiative"
          />
        }
      </>
    );
  }

  onLocaleChange = (locale: Locale) => {
    this.setState({ selectedLocale: locale });
  }

  handleBodyOnChange = (value: string, locale: Locale | undefined) => {
    if (locale && this.props.onChangeBody) {
      this.props.onChangeBody({
        ...this.props.newOfficialFeedback.body_multiloc,
        [locale]: value
      });
    }
  }

  handleAuthorOnChange = (value: string, locale: Locale | undefined) => {
    if (locale && this.props.onChangeAuthor) {
      this.props.onChangeAuthor({
        ...this.props.newOfficialFeedback.author_multiloc,
        [locale]: value
      });
    }
  }

  renderFeedbackForm = () => {
    const { intl: { formatMessage }, newOfficialFeedback } = this.props;
    const { selectedLocale } = this.state;

    return (
      <StyledSection>
        <StyledFormLocaleSwitcher
          onLocaleChange={this.onLocaleChange}
          selectedLocale={selectedLocale}
          values={newOfficialFeedback}
        />

        <StyledMentionsTextArea
          placeholder={formatMessage(messages.feedbackBodyPlaceholder)}
          rows={8}
          padding="12px"
          background="#fff"
          ariaLabel={formatMessage(messages.officialUpdateBody)}
          name="body_multiloc"
          value={newOfficialFeedback.body_multiloc?.[selectedLocale] || ''}
          locale={selectedLocale}
          onChange={this.handleBodyOnChange}
        />

        <StyledInput
          type="text"
          value={newOfficialFeedback?.author_multiloc?.[selectedLocale] || ''}
          locale={selectedLocale}
          placeholder={formatMessage(messages.feedbackAuthorPlaceholder)}
          ariaLabel={formatMessage(messages.officialUpdateAuthor)}
          onChange={this.handleAuthorOnChange}
        />
      </StyledSection>
    );
  }

  render() {
    const { latestOfficialFeedback, intl: { formatMessage }, submit, loading, error, valid } = this.props;

    return (
      <>
        {latestOfficialFeedback
          ? this.renderFullForm()
          : this.renderFeedbackForm()
        }
        <ChangeStatusButton
          processing={loading}
          disabled={!valid}
          onClick={submit}
          bgColor={colors.clBlue}
        >
          <FormattedMessage {...messages.statusChangeSave}/>
        </ChangeStatusButton>
        {error && <Error text={formatMessage(messages.statusChangeGenericError)}/>}
      </>
    );
  }
}

export default injectIntl(StatusChangeForm);

import React, { PureComponent } from 'react';

// Styling
import styled from 'styled-components';
import { colors, fontSizes } from 'utils/styleUtils';

// resources
import { IOfficialFeedbackData } from 'services/officialFeedback';

// intl
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from '../../messages';

// components
import OfficialFeedbackPost from 'components/PostComponents/OfficialFeedback/OfficialFeedbackPost';
import Radio from 'components/UI/Radio';
import { Section } from 'components/admin/Section';
import FormLocaleSwitcher from 'components/admin/FormLocaleSwitcher';
import MentionsTextAreaMultiloc from 'components/UI/MentionsTextAreaMultiloc';
import InputMultiloc from 'components/UI/InputMultiloc';
import Error from 'components/UI/Error';
import Button from 'components/UI/Button';

// Typings
import { Multiloc, Locale, MultilocFormValues } from 'typings';

const StyledFormLocaleSwitcher = styled(FormLocaleSwitcher)`
  margin: 10px 0;
`;

const StyledRadio = styled(Radio)`
  margin-top: 25px;
`;
const StyledButton = styled(Button)`
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
  onChangeBody: (value) => void;
  onChangeAuthor: (value) => void;
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
            last={false}
          />
        }
      </>
    );
  }

  onLocaleChange = (locale: Locale) => () => {
    this.setState({ selectedLocale: locale });
  }

  renderFeedbackForm = () => {
    const { intl: { formatMessage }, newOfficialFeedback, onChangeBody, onChangeAuthor } = this.props;
    const { selectedLocale } = this.state;

    return (
      <Section>
        <StyledFormLocaleSwitcher
          onLocaleChange={this.onLocaleChange}
          selectedLocale={selectedLocale}
          values={newOfficialFeedback}
        />

        <MentionsTextAreaMultiloc
          shownLocale={selectedLocale}
          placeholder={formatMessage(messages.feedbackBodyPlaceholder)}
          rows={8}
          padding="12px"
          fontSize={fontSizes.base}
          backgroundColor="#FFF"
          placeholderFontWeight="400"
          ariaLabel={formatMessage(messages.officialUpdateBody)}
          name="body_multiloc"
          valueMultiloc={newOfficialFeedback.body_multiloc}
          onChange={onChangeBody}
        />

        <InputMultiloc
          shownLocale={selectedLocale}
          placeholder={formatMessage(messages.feedbackAuthorPlaceholder)}
          ariaLabel={formatMessage(messages.officialUpdateAuthor)}
          valueMultiloc={newOfficialFeedback.author_multiloc}
          onChange={onChangeAuthor}
          type="text"
        />
      </Section>
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
        <StyledButton
          processing={loading}
          disabled={!valid}
          onClick={submit}
          bgColor={colors.clBlue}
        >
          <FormattedMessage {...messages.statusChangeSave}/>
        </StyledButton>
        {error && <Error text={formatMessage(messages.statusChangeGenericError)}/>}
      </>
    );
  }
}

export default injectIntl(StatusChangeForm);

import React, { PureComponent } from 'react';
import { adopt } from 'react-adopt';

// Styling
import styled from 'styled-components';
import { fontSizes } from 'utils/styleUtils';

// resources
import { isNilOrError } from 'utils/helperUtils';
import GetInitiative, { GetInitiativeChildProps } from 'resources/GetInitiative';
import GetInitiativeStatus, { GetInitiativeStatusChildProps } from 'resources/GetInitiativeStatus';
import GetOfficialFeedbacks, { GetOfficialFeedbacksChildProps } from 'resources/GetOfficialFeedbacks';

// services
import { updateInitiativeStatusWithExistingFeedback, updateInitiativeStatusAddFeedback } from 'services/initiativeStatusChanges';

// intl
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from '../../messages';
import T from 'components/T';

// components
import OfficialFeedbackPost from 'components/PostComponents/OfficialFeedback/OfficialFeedbackPost';
import OfficialFeedbackForm from 'components/PostComponents/OfficialFeedback/Form/OfficialFeedbackForm';
import Radio from 'components/UI/Radio';
import { Section } from 'components/admin/Section';
import FormLocaleSwitcher from 'components/admin/FormLocaleSwitcher';
import MentionsTextAreaMultiloc from 'components/UI/MentionsTextAreaMultiloc';
import InputMultiloc from 'components/UI/InputMultiloc';
import Error from 'components/UI/Error';
import Button from 'components/UI/Button';

// Typings
import { Multiloc, Locale, MultilocFormValues } from 'typings';

const Container = styled.div``;

const StyledFormLocaleSwitcher = styled(FormLocaleSwitcher)`
  margin: 10px 0;
`;

interface InputProps {
  initiativeId: string;
  newStatusId: string;
  closeModal: () => void;
}

interface DataProps {
  initiative: GetInitiativeChildProps;
  newStatus: GetInitiativeStatusChildProps;
  officialFeedbacks: GetOfficialFeedbacksChildProps;
}

interface Props extends DataProps, InputProps { }

export interface FormValues extends MultilocFormValues {
  author_multiloc: Multiloc;
  body_multiloc: Multiloc;
}

interface State {
  mode: 'latest' | 'new';
  newOfficialFeedback: FormValues;
  selectedLocale: Locale;
  loading: boolean;
  touched: boolean;
  error: boolean;
}

class StatusChangeForm extends PureComponent<Props & InjectedIntlProps, State> {
  constructor(props: Props & InjectedIntlProps) {
    super(props);
    this.state = {
      mode: 'new',
      newOfficialFeedback: {
        author_multiloc: {},
        body_multiloc: {}
      },
      selectedLocale: props.intl.locale as Locale,
      loading: false,
      touched: false,
      error: false
    };
  }
  handleRadioClick = (event) => {
    this.setState({ mode: event });
  }
  renderFullForm = () => {
    const { mode } = this.state;
    const { initiative, officialFeedbacks } = this.props;
    if (isNilOrError(initiative) || isNilOrError(officialFeedbacks.officialFeedbacksList)) return null;

    return (
      <>
        <Radio
          onChange={this.handleRadioClick}
          currentValue={mode}
          value="new"
          name="statusChangeMethod"
          label="Write a new feedback"
        />
        {mode === 'new' &&
          this.renderFeedbackForm()
        }
        <Radio
          onChange={this.handleRadioClick}
          currentValue={mode}
          value="latest"
          name="statusChangeMethod"
          label="Use latest feedback"
        />

        {mode === 'latest' &&
          <OfficialFeedbackPost
            editingAllowed={false}
            officialFeedbackPost={officialFeedbacks.officialFeedbacksList.data[0]}
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

  onChangeBody = (value) => {
    this.setState((state) => ({ newOfficialFeedback: { ...state.newOfficialFeedback, body_multiloc: value }, touched: true }));
  }
  onChangeAuthor = (value) => {
    this.setState((state) => ({ newOfficialFeedback: { ...state.newOfficialFeedback, author_multiloc: value }, touched: true }));
  }

  validate = () => {
    const { mode, newOfficialFeedback, touched } = this.state;
    if (mode === 'new') {
      const validation = OfficialFeedbackForm.validate(newOfficialFeedback);
      return Object.keys(validation).length === 0 && touched;
    } else {
      return true;
    }
  }

  renderFeedbackForm = () => {
    const { initiative, intl: { formatMessage } } = this.props;
    const { selectedLocale, newOfficialFeedback } = this.state;

    if (isNilOrError(initiative)) return null;

    return (
      <Section>
        <StyledFormLocaleSwitcher
          onLocaleChange={this.onLocaleChange}
          selectedLocale={selectedLocale}
          values={newOfficialFeedback}
        />

        <MentionsTextAreaMultiloc
          shownLocale={this.state.selectedLocale}
          placeholder={formatMessage(messages.feedbackBodyPlaceholder)}
          rows={8}
          padding="12px"
          fontSize={fontSizes.base}
          backgroundColor="#FFF"
          placeholderFontWeight="400"
          ariaLabel={formatMessage(messages.officialUpdateBody)}
          name="body_multiloc"
          valueMultiloc={newOfficialFeedback.body_multiloc}
          onChange={this.onChangeBody}
        />

        <InputMultiloc
          shownLocale={this.state.selectedLocale}
          placeholder={formatMessage(messages.feedbackAuthorPlaceholder)}
          ariaLabel={formatMessage(messages.officialUpdateAuthor)}
          valueMultiloc={newOfficialFeedback.author_multiloc}
          onChange={this.onChangeAuthor}
          type="text"
        />
      </Section>
    );
  }

  submit = () => {
    const { initiativeId, newStatusId, closeModal, officialFeedbacks } = this.props;
    const { mode, newOfficialFeedback : { body_multiloc, author_multiloc } } = this.state;
    if (mode === 'new') {
      this.setState({ loading: true });
      updateInitiativeStatusAddFeedback(initiativeId, newStatusId, body_multiloc, author_multiloc)
        .then(() => closeModal())
        .catch(err => {
          this.setState({ loading: false, error: true });
        });
    } else if (mode === 'latest' && !isNilOrError(officialFeedbacks.officialFeedbacksList)) {
      updateInitiativeStatusWithExistingFeedback(initiativeId, newStatusId, officialFeedbacks.officialFeedbacksList.data[0].id)
      .then(() => closeModal())
      .catch(err => {
        this.setState({ loading: false, error: true });
      });
    }
  }

  render() {
    const { initiative, newStatus, officialFeedbacks, intl: { formatMessage } } = this.props;
    const { loading, error } = this.state;

    if (isNilOrError(initiative) || isNilOrError(newStatus) || officialFeedbacks.officialFeedbacksList === undefined) return null;

    return (
      <Container>
        <h1>
          <T value={initiative.attributes.title_multiloc} />
        </h1>
        <FormattedMessage
          {...messages.statusChange}
          values={{
            newStatus: <T value={newStatus.attributes.title_multiloc} />
          }}
        />
        {!isNilOrError(officialFeedbacks.officialFeedbacksList) && officialFeedbacks.officialFeedbacksList.data.length > 0
          ? this.renderFullForm()
          : this.renderFeedbackForm()
        }
        <Button
          processing={loading}
          disabled={!this.validate()}
          onClick={this.submit}
        >
          <FormattedMessage {...messages.statusChangeSave}/>
        </Button>
        {error && <Error text={formatMessage(messages.statusChangeGenericError)}/>}
      </Container>
    );
  }
}

const Data = adopt<DataProps, InputProps>({
  initiative: ({ initiativeId, render }) => <GetInitiative id={initiativeId}>{render}</GetInitiative>,
  newStatus: ({ newStatusId, render }) => <GetInitiativeStatus id={newStatusId}>{render}</GetInitiativeStatus>,
  officialFeedbacks: ({ initiativeId, render }) => <GetOfficialFeedbacks postId={initiativeId} postType="initiative">{render}</GetOfficialFeedbacks>
});

const StatusChangeFormWithHocs = injectIntl(StatusChangeForm);

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {dataProps => <StatusChangeFormWithHocs {...inputProps} {...dataProps} />}
  </Data>
);

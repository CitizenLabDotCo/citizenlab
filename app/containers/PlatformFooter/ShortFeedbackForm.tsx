// libraries
import React, { PureComponent } from 'react';
import { omit } from 'lodash-es';
import { adopt } from 'react-adopt';
import { Subscription } from 'rxjs';

// translations
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// components
import { Input } from 'cl2-component-library';
import { SectionField } from 'components/admin/Section';
import TextArea from 'components/UI/TextArea';
import Error from 'components/UI/Error';
import { FormLabel } from 'components/UI/FormComponents';

// utils
import eventEmitter from 'utils/eventEmitter';

// resources, services, typings
import GetLocale, { GetLocaleChildProps } from 'resources/GetLocale';
import { postProductFeedback } from 'services/productFeedback';
import { removeUrlLocale } from 'services/locale';
import { CLError } from 'typings';

// styling
import styled from 'styled-components';
import { fontSizes, media } from 'utils/styleUtils';
import { isCLErrorJSON } from 'utils/errorUtils';

const Container = styled.div``;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  padding: 30px;
  padding-bottom: 15px;

  ${media.smallerThanMinTablet`
    padding: 15px;
  `}
`;

const Submitted = styled.span`
  height: 370px;
  font-size: ${fontSizes.large}px;
  text-align: center;
  padding-left: 25px;
  padding-right: 25px;
  display: flex;
  align-items: center;
  justify-content: center;

  ${media.smallerThanMinTablet`
    height: 300px;
  `}
`;

interface DataProps {
  locale: GetLocaleChildProps;
}

interface InputProps {
  closeModal: () => void;
  submitting: (submitting: boolean) => void;
  successfullySubmitted: () => void;
}

interface Props extends InputProps, DataProps {}

interface State {
  emailValue: string;
  feedbackValue: string;
  apiErrors?: { [fieldName: string]: CLError[] };
  submitted: boolean;
  feedbackValueError: JSX.Element | null;
}

class ShortFeedbackForm extends PureComponent<Props, State> {
  subscriptions: Subscription[] = [];

  constructor(props) {
    super(props);
    this.state = {
      emailValue: '',
      feedbackValue: '',
      submitted: false,
      feedbackValueError: null,
    };
  }

  componentDidMount() {
    this.subscriptions = [
      eventEmitter
        .observeEvent('ShortFeedbackFormSubmitEvent')
        .subscribe(() => {
          this.onSubmit();
        }),
    ];
  }

  componentWillUnmount() {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  onChangeFeedback = (feedbackValue: string) => {
    this.setState((prev) => ({
      feedbackValue,
      apiErrors: omit(prev.apiErrors, 'message'),
    }));
  };

  onChangeEmail = (emailValue: string) => {
    this.setState((prev) => ({
      emailValue,
      apiErrors: omit(prev.apiErrors, 'email'),
    }));
  };

  validateFeedbackValue = () => {
    const { feedbackValue } = this.state;
    if (!feedbackValue) {
      return <FormattedMessage {...messages.feedbackEmptyError} />;
    }

    return null;
  };

  validateForm = () => {
    const feedbackValueError = this.validateFeedbackValue();

    this.setState({ feedbackValueError });

    if (!feedbackValueError) {
      return true;
    } else {
      return false;
    }
  };

  onSubmit = async () => {
    const { emailValue, feedbackValue } = this.state;
    const isFormValid = this.validateForm();

    if (isFormValid) {
      try {
        this.props.submitting(true);
        await postProductFeedback({
          question: 'found_what_youre_looking_for?',
          page: removeUrlLocale(location.pathname),
          locale: this.props.locale || undefined,
          answer: 'no',
          email: emailValue.length > 0 ? emailValue : null,
          message: feedbackValue,
        });
        this.setState({ submitted: true });
        this.props.submitting(false);
        this.props.successfullySubmitted();
      } catch (error) {
        if (isCLErrorJSON(error)) {
          this.props.submitting(false);
          this.setState({
            submitted: false,
            apiErrors: error.json.errors,
          });
        }
      }
    }
  };

  render() {
    const {
      emailValue,
      feedbackValue,
      submitted,
      feedbackValueError,
    } = this.state;

    return (
      <Container aria-live="polite">
        {submitted ? (
          <Submitted>
            <FormattedMessage {...messages.feedbackSuccessfullySubmitted} />
          </Submitted>
        ) : (
          <Form>
            <SectionField className="fullWidth">
              <FormLabel
                labelMessage={messages.feedback}
                htmlFor="short-feedback-textarea"
              />
              <TextArea
                autofocus={true}
                name="feedback"
                value={feedbackValue}
                onChange={this.onChangeFeedback}
                id="short-feedback-textarea"
              />
              {feedbackValueError && <Error text={feedbackValueError} />}
              {this.state.apiErrors && (
                <Error apiErrors={this.state.apiErrors.message} />
              )}
            </SectionField>

            <SectionField className="fullWidth">
              <FormLabel
                labelMessage={messages.email}
                htmlFor="short-feedback-email"
              />
              <Input
                type="text"
                value={emailValue}
                onChange={this.onChangeEmail}
                autocomplete="email"
                id="short-feedback-email"
              />
              {this.state.apiErrors && (
                <Error apiErrors={this.state.apiErrors.email} />
              )}
            </SectionField>
          </Form>
        )}
      </Container>
    );
  }
}

const Data = adopt<DataProps, InputProps>({
  locale: <GetLocale />,
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {(dataProps) => <ShortFeedbackForm {...inputProps} {...dataProps} />}
  </Data>
);

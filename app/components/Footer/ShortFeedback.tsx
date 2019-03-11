// libraries
import React, { PureComponent } from 'react';
import * as Sentry from '@sentry/browser';

// translations
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// components
import { ShortFeedbackContainer, ThankYouNote, FeedbackQuestion, Buttons, FeedbackButton } from './StyledComponents';
import Modal from 'components/UI/Modal';
import ShortFeedbackForm from './ShortFeedbackForm';
import { postProductFeedback } from 'services/productFeedback';
import GetLocale, { GetLocaleChildProps } from 'resources/GetLocale';
import { adopt } from 'react-adopt';
import { removeUrlLocale } from 'services/locale';

interface DataProps {
  locale: GetLocaleChildProps;
}

interface InputProps {}

interface Props extends InputProps, DataProps {}

interface State {
  shortFeedbackButtonClicked: boolean;
  feedbackModalOpen: boolean;
}

class ShortFeedback extends PureComponent<Props, State>{
  constructor(props) {
    super(props);
    this.state = {
      shortFeedbackButtonClicked: false,
      feedbackModalOpen: false
    };
  }

  handleFeedbackButtonClick = (answer: 'yes' | 'no') => () => {
    this.setState({
      shortFeedbackButtonClicked: true
    });

    if (answer === 'yes') {
      postProductFeedback({
        question: 'found_what_youre_looking_for?',
        page: removeUrlLocale(location.pathname),
        locale: this.props.locale || undefined,
        answer: 'yes'
      }).catch(err => Sentry.captureException(err));
    } else if (answer === 'no') {
      this.openFeedbackModal();
    }
  }

  openFeedbackModal = () => this.setState({ feedbackModalOpen: true });
  closeFeedbackModalSuccess = () => this.setState({ feedbackModalOpen: false });
  closeFeedbackModalCancel = () => {
    this.setState({ feedbackModalOpen: false });
    postProductFeedback({
      question: 'found_what_youre_looking_for?',
      page: removeUrlLocale(location.pathname),
      locale: this.props.locale || undefined,
      answer: 'no'
    }).catch(err => Sentry.captureException(err));
  }

  render() {
    const { shortFeedbackButtonClicked, feedbackModalOpen } = this.state;

    return (
      <>
        <ShortFeedbackContainer>
          {shortFeedbackButtonClicked ?
            (feedbackModalOpen ?
              <ThankYouNote>
                <FormattedMessage {...messages.moreInfo} />
              </ThankYouNote>
              :
              <ThankYouNote>
                <FormattedMessage {...messages.thanksForFeedback} />
              </ThankYouNote>)
            :
            <>
              <FeedbackQuestion>
                <FormattedMessage {...messages.feedbackQuestion} />
              </FeedbackQuestion>
              <Buttons>
                <FeedbackButton onClick={this.handleFeedbackButtonClick('yes')}>
                  <FormattedMessage {...messages.yes} />
                </FeedbackButton>
                <FeedbackButton onClick={this.handleFeedbackButtonClick('no')}>
                  <FormattedMessage {...messages.no} />
                </FeedbackButton>
              </Buttons>
            </>
          }
        </ShortFeedbackContainer>
        <Modal
          fixedHeight={false}
          opened={feedbackModalOpen}
          close={this.closeFeedbackModalCancel}
          className="e2e-feedback-modal"
        >
          <ShortFeedbackForm
            closeModal={this.closeFeedbackModalSuccess}
          />
        </Modal>
      </>
    );
  }
}

const Data = adopt<DataProps, InputProps>({
  locale: <GetLocale/>
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {dataProps => <ShortFeedback {...inputProps} {...dataProps} />}
  </Data>
);

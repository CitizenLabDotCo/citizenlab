// libraries
import React, { PureComponent } from 'react';

// translations
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// tracking
import { trackEventByName } from 'utils/analytics';
import tracks from './tracks';

// components
import { ShortFeedbackContainer, ThankYouNote, FeedbackQuestion, Buttons, FeedbackButton } from './StyledComponents';
import Modal from 'components/UI/Modal';
import ShortFeedbackForm from './ShortFeedbackForm';

interface Props {}

interface State {
  shortFeedbackButtonClicked: boolean;
  feedbackModalOpen: boolean;
}

export default class ShortFeedback extends PureComponent<Props, State>{
  constructor(props) {
    super(props);
    this.state = {
      shortFeedbackButtonClicked: false,
      feedbackModalOpen: false
    };
  }

  handleFeedbackButtonClick = (answer: 'yes' | 'no') => () => {
    const { clickShortFeedbackYes, clickShortFeedbackNo } = tracks;

    this.setState({
      shortFeedbackButtonClicked: true
    });

    // tracking
    if (answer === 'yes') {
      trackEventByName(clickShortFeedbackYes.name);
    } else if (answer === 'no') {
      trackEventByName(clickShortFeedbackNo.name);
      this.openFeedbackModal();
    }
  }

  openFeedbackModal = () => this.setState({ feedbackModalOpen: true });
  closeFeedbackModal = () => this.setState({ feedbackModalOpen: false });

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
          close={this.closeFeedbackModal}
          className="e2e-feedback-modal"
        >
          <ShortFeedbackForm
            closeModal={this.closeFeedbackModal}
          />
        </Modal>
      </>
    );
  }
}

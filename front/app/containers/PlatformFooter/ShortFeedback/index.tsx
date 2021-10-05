import React, { useState } from 'react';
import { reportError } from 'utils/loggingUtils';
import { isNilOrError } from 'utils/helperUtils';

// utils
import eventEmitter from 'utils/eventEmitter';

// components
import Modal from 'components/UI/Modal';
import ShortFeedbackForm from './ShortFeedbackForm';
import { postProductFeedback } from 'services/productFeedback';
import Button from 'components/UI/Button';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';

// tracking
import { trackEventByName } from 'utils/analytics';
import tracks from '../tracks';

// services
import { removeUrlLocale } from 'services/locale';

// style
import styled from 'styled-components';
import { transparentize } from 'polished';
import { media, colors, fontSizes, isRtl } from 'utils/styleUtils';

// hooks
import useLocale from 'hooks/useLocale';

const Container = styled.div`
  ${media.biggerThanMaxTablet`
    position: absolute;
    top: -25px;
    left: 25px;
    z-index: 3;

    ${isRtl`
      left: auto;
      right: 25px;
    `}
  `}

  ${media.smallerThanMaxTablet`
    display: flex;
    justify-content: center;
    background: ${colors.background};
    background: ${(props) => transparentize(0.9, props.theme.colorText)};
    border-top: solid 1px #ccc;
  `}
`;

const X = styled.div`
  display: flex;
  align-items: center;

  ${isRtl`
    flex-direction: row-reverse;
  `}

  ${media.smallerThanMaxTablet`
    justify-content: center;
    margin: 0;
    margin-top: 10px;
    margin-bottom: 10px;
  `}
`;

const FeedbackQuestion = styled.span`
  color: ${({ theme }) => theme.colorText};
  font-size: ${fontSizes.small}px;
  font-weight: 400;
  line-height: normal;
  margin-right: 15px;

  ${isRtl`
    margin-right: 0;
    margin-left: 15px;
  `}
`;

const FeedbackButtons = styled.div`
  display: flex;
  align-items: center;
`;

const FeedbackButton = styled.button`
  color: ${({ theme }) => theme.colorText};
  font-size: ${fontSizes.small}px;
  font-weight: 600;
  line-height: normal;
  text-align: left;
  text-transform: uppercase;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  margin: 0;
  cursor: pointer;
  appearance: none;

  &.hasLeftMargin {
    margin-left: 14px;
  }

  &:hover {
    text-decoration: underline;
  }
`;

const ThankYouNote = styled.span`
  color: ${({ theme }) => theme.colorText};
  font-size: ${fontSizes.small}px;
  font-weight: 400;
  line-height: normal;
`;

const ShortFeedbackFormModalFooter = styled.div`
  display: flex;
`;

interface Props {}

const ShortFeedback = (_props: Props) => {
  const locale = useLocale();
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);
  const [shortFeedbackButtonClicked, setShortFeedbackButtonClicked] = useState(
    false
  );
  const handleFeedbackButtonClick = (answer: 'yes' | 'no') => () => {
    setShortFeedbackButtonClicked(true);

    // tracking
    if (answer === 'yes') {
      trackEventByName(tracks.clickShortFeedbackYes);
      postProductFeedback({
        question: 'found_what_youre_looking_for?',
        page: removeUrlLocale(location.pathname),
        locale: !isNilOrError(locale) ? locale : undefined,
        answer: 'yes',
      }).catch((err) => {
        reportError(err);
      });
    } else if (answer === 'no') {
      trackEventByName(tracks.clickShortFeedbackNo);
      setFeedbackModalOpen(true);
    }
  };

  const closeFeedbackModal = () => {
    setFeedbackModalOpen(false);
  };

  const closeFeedbackModalSuccess = () => {
    setFeedbackModalOpen(false);
  };

  const handleFeedbackOnSubmit = (submitting: boolean) => {
    setFeedbackSubmitting(submitting);
  };

  const handleFeedbackSubmitted = () => {
    setFeedbackSubmitted(true);
  };

  const closeFeedbackModalCancel = () => {
    setFeedbackModalOpen(false);
    setFeedbackSubmitting(false);

    postProductFeedback({
      question: 'found_what_youre_looking_for?',
      page: removeUrlLocale(location.pathname),
      locale: !isNilOrError(locale) ? locale : undefined,
      answer: 'no',
    }).catch((err) => reportError(err));
  };

  const shortFeedbackFormOnSubmit = () => {
    eventEmitter.emit('ShortFeedbackFormSubmitEvent');
  };

  return (
    <Container>
      <X>
        {shortFeedbackButtonClicked ? (
          feedbackModalOpen ? (
            <ThankYouNote>
              <FormattedMessage {...messages.moreInfo} />
            </ThankYouNote>
          ) : (
            <ThankYouNote>
              <FormattedMessage {...messages.thanksForFeedback} />
            </ThankYouNote>
          )
        ) : (
          <>
            <FeedbackQuestion>
              <FormattedMessage {...messages.feedbackQuestion} />
            </FeedbackQuestion>
            <FeedbackButtons>
              <FeedbackButton onClick={handleFeedbackButtonClick('yes')}>
                <FormattedMessage {...messages.yes} />
              </FeedbackButton>
              <FeedbackButton
                className="hasLeftMargin"
                onClick={handleFeedbackButtonClick('no')}
              >
                <FormattedMessage {...messages.no} />
              </FeedbackButton>
            </FeedbackButtons>
          </>
        )}
      </X>
      <Modal
        width={500}
        opened={feedbackModalOpen}
        close={closeFeedbackModalCancel}
        className="e2e-feedback-modal"
        closeOnClickOutside={false}
        header={<FormattedMessage {...messages.feedbackModalTitle} />}
        footer={
          <ShortFeedbackFormModalFooter>
            {!feedbackSubmitted ? (
              <Button
                onClick={shortFeedbackFormOnSubmit}
                processing={feedbackSubmitting}
              >
                <FormattedMessage {...messages.submit} />
              </Button>
            ) : (
              <Button buttonStyle="secondary" onClick={closeFeedbackModal}>
                <FormattedMessage {...messages.close} />
              </Button>
            )}
          </ShortFeedbackFormModalFooter>
        }
      >
        <ShortFeedbackForm
          closeModal={closeFeedbackModalSuccess}
          submitting={handleFeedbackOnSubmit}
          successfullySubmitted={handleFeedbackSubmitted}
        />
      </Modal>
    </Container>
  );
};

export default ShortFeedback;

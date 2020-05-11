import React, { PureComponent } from 'react';
import { reportError } from 'utils/loggingUtils';
import { adopt } from 'react-adopt';

// utils
import Link from 'utils/cl-router/Link';
import eventEmitter from 'utils/eventEmitter';

// components
import SendFeedback from 'components/SendFeedback';
import Modal from 'components/UI/Modal';
import ShortFeedbackForm from './ShortFeedbackForm';
import { postProductFeedback } from 'services/productFeedback';
import Button from 'components/UI/Button';
import Icon from 'components/UI/Icon';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// tracking
import { trackEventByName } from 'utils/analytics';
import tracks from './tracks';

// services
import { removeUrlLocale } from 'services/locale';
import { LEGAL_PAGES } from 'services/pages';

// resources
import GetLocale, { GetLocaleChildProps } from 'resources/GetLocale';
import GetWindowSize, { GetWindowSizeChildProps } from 'resources/GetWindowSize';

// style
import styled from 'styled-components';
import { rgba } from 'polished';
import { media, colors, fontSizes, viewportWidths } from 'utils/styleUtils';

const Container = styled.footer`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  position: relative;

  ${media.smallerThanMaxTablet`
    padding-bottom: ${props => props.theme.mobileMenuHeight}px;
  `}
`;

const Inner = styled.div`
  width: 100%;
  min-height: ${props => props.theme.footerHeight}px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-left: 28px;
  padding-right: 28px;
  padding-top: 12px;
  padding-bottom: 12px;
  background: #fff;
  border-top: solid 1px #e8e8e8;

  ${media.smallerThanMaxTablet`
    display: flex;
    flex-direction: column;
    justify-content: center;
  `}

  ${media.smallerThanMinTablet`
    padding: 15px;
    border-top: solid 1px #e8e8e8;

    &.showShortFeedback {
      border-top: none;
    }
  `}
`;

const ShortFeedback: any = styled.div`
  width: 100%;
  display: flex;

  ${media.biggerThanMinTablet`
    position: absolute;
    z-index: 5;
    top: -41px;
    left: 0px;
  `}

  ${media.smallerThanMinTablet`
    border-top: solid 1px ${({ theme }) => rgba(theme.colorText, 0.3)};
    border-bottom: solid 1px ${({ theme }) => rgba(theme.colorText, 0.3)};
  `}
`;

const ShortFeedbackInner: any = styled.div`
  color: ${({ theme }) => theme.colorText};
  font-size: ${fontSizes.small}px;
  font-weight: 300;
  line-height: normal;
  display: flex;
  align-items: center;
  padding: 12px 25px;
  background: ${({ theme }) => rgba(theme.colorText, 0.08)};

  ${media.smallerThanMinTablet`
    width: 100%;
    justify-content: center;
  `}
`;

const ThankYouNote = styled.span`
  font-weight: 300;
`;

const FeedbackQuestion = styled.span`
  margin-right: 15px;

  ${media.smallerThanMinTablet`
    margin-right: 10px;
  `}
`;

const Buttons = styled.div`
  display: flex;
`;

const FeedbackButton = styled.button`
  color: ${({ theme }) => theme.colorText};
  font-weight: 500;
  text-transform: uppercase;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 12px;
  margin-bottom: -3px;
  z-index: 1;

  ${media.smallerThanMinTablet`
    padding: 0 8px;
  `}

  &:focus,
  &:hover {
    outline: none;
    cursor: pointer;
    text-decoration: underline;
  }
`;

const PagesNav = styled.nav`
  color: ${colors.label};
  font-weight: 300;
  text-align: center;
  overflow: hidden;

  ${media.smallerThanMaxTablet`
    margin-top: 15px;
    margin-bottom: 15px;
  `}
`;

const StyledButton = styled.button`
  color: ${colors.label};
  font-weight: 300;
  font-size: ${fontSizes.small}px;
  line-height: 21px;
  text-decoration: none;
  hyphens: auto;
  padding: 0;
  margin: 0;
  border: none;
  cursor: pointer;

  &:hover {
    color: #000;
    text-decoration: underline;
  }
`;

const StyledLink = styled(Link)`
  color: ${colors.label};
  font-weight: 300;
  font-size: ${fontSizes.small}px;
  line-height: 21px;
  text-decoration: none;
  hyphens: auto;
  padding: 0;
  margin: 0;
  border: none;
  cursor: pointer;

  &:hover {
    color: #000;
    text-decoration: underline;
  }
`;

const Bullet = styled.span`
  color: ${colors.label};
  font-weight: 300;
  font-size: ${fontSizes.small}px;
  line-height: 21px;
  margin-left: 10px;
  margin-right: 10px;
`;

const Right = styled.div`
  display: flex;
  align-items: center;

  ${media.smallerThanMaxTablet`
    margin-top: 15px;
    margin-bottom: 15px;
  `}

  ${media.smallerThanMinTablet`
    flex-direction: column;
  `}
`;

const PoweredBy = styled.div`
  color: ${colors.label};
  font-size: ${fontSizes.base}px;
  font-weight: 300;
  text-decoration: none;
  display: flex;
  align-items: center;
  outline: none;
  padding-right: 20px;
  margin-right: 24px;
  border-right: 2px solid ${colors.adminBackground};

  ${media.smallerThanMinTablet`
    flex-direction: column;
    padding: 0px;
    margin: 0px;
    margin-bottom: 15px;
    border: none;
  `}
`;

const PoweredByText = styled.span`
  margin-right: 5px;

  ${media.smallerThanMinTablet`
    margin: 0;
    margin-bottom: 10px;
  `}
`;

const CitizenlabLink = styled.a`
  width: 151px;
  height: 27px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
`;

const StyledSendFeedback = styled(SendFeedback)`
  ${media.smallerThanMinTablet`
    margin-top: 25px;
  `}
`;

const ShortFeedbackFormModalFooter = styled.div`
  width: 100%;
  display: flex;
`;

const CitizenLabLogo = styled(Icon)`
  fill: ${colors.secondaryText};

  &:hover {
    fill: #000;
  }
`;

interface InputProps {
  showShortFeedback?: boolean;
  className?: string;
}

interface DataProps {
  locale: GetLocaleChildProps;
  windowSize: GetWindowSizeChildProps;
}

interface Props extends DataProps, InputProps {}

interface State {
  shortFeedbackButtonClicked: boolean;
  feedbackModalOpen: boolean;
  feedbackSubmitting: boolean;
  feedbackSubmitted: boolean;
}

class Footer extends PureComponent<Props, State> {
  static defaultProps = {
    showShortFeedback: true
  };

  constructor(props) {
    super(props);
    this.state = {
      shortFeedbackButtonClicked: false,
      feedbackModalOpen: false,
      feedbackSubmitting: false,
      feedbackSubmitted: false
    };
  }

  handleFeedbackButtonClick = (answer: 'yes' | 'no') => () => {
    this.setState({
      shortFeedbackButtonClicked: true
    });

    // tracking
    if (answer === 'yes') {
      trackEventByName(tracks.clickShortFeedbackYes);
      postProductFeedback({
        question: 'found_what_youre_looking_for?',
        page: removeUrlLocale(location.pathname),
        locale: this.props.locale || undefined,
        answer: 'yes'
      }).catch(err => {
        reportError(err);
      });
    } else if (answer === 'no') {
      trackEventByName(tracks.clickShortFeedbackNo);
      this.openFeedbackModal();
    }
  }

  openFeedbackModal = () => {
    this.setState({ feedbackModalOpen: true });
  }

  closeFeedbackModal = () => {
    this.setState({ feedbackModalOpen: false });
  }

  closeFeedbackModalSuccess = () => {
    this.setState({ feedbackModalOpen: false });
  }

  handleFeedbackOnSubmit = (submitting: boolean) => {
    this.setState({ feedbackSubmitting: submitting });
  }

  handleFeedbackSubmitted = () => {
    this.setState({ feedbackSubmitted: true });
  }

  closeFeedbackModalCancel = () => {
    this.setState({ feedbackModalOpen: false });

    postProductFeedback({
      question: 'found_what_youre_looking_for?',
      page: removeUrlLocale(location.pathname),
      locale: this.props.locale || undefined,
      answer: 'no'
    }).catch(err => reportError(err));
  }

  shortFeedbackFormOnSubmit = () => {
    eventEmitter.emit('Footer', 'ShortFeedbackFormSubmitEvent', null);
  }

  openConsentManager = () => {
    eventEmitter.emit('footer', 'openConsentManager', null);
  }

  render() {
    const { shortFeedbackButtonClicked, feedbackModalOpen, feedbackSubmitting, feedbackSubmitted } = this.state;
    const { showShortFeedback, className, windowSize } = this.props;
    const smallerThanSmallTablet = windowSize ? windowSize <= viewportWidths.smallTablet : false;

    return (
      <Container id="hook-footer" className={className}>
        {showShortFeedback &&
          <>
            <ShortFeedback>
              <ShortFeedbackInner>
                {shortFeedbackButtonClicked ?
                  (feedbackModalOpen ?
                    <ThankYouNote>
                      <FormattedMessage {...messages.moreInfo} />
                    </ThankYouNote>
                    :
                    <ThankYouNote>
                      <FormattedMessage {...messages.thanksForFeedback} />
                    </ThankYouNote>
                  )
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
              </ShortFeedbackInner>
            </ShortFeedback>

            <Modal
              width={500}
              opened={feedbackModalOpen}
              close={this.closeFeedbackModalCancel}
              className="e2e-feedback-modal"
              closeOnClickOutside={false}
              header={<FormattedMessage {...messages.feedbackModalTitle} />}
              footer={
                <ShortFeedbackFormModalFooter>
                  {!feedbackSubmitted ? (
                    <Button onClick={this.shortFeedbackFormOnSubmit} processing={feedbackSubmitting}>
                      <FormattedMessage {...messages.submit} />
                    </Button>
                  ) : (
                    <Button buttonStyle="secondary" onClick={this.closeFeedbackModal}>
                      <FormattedMessage {...messages.close} />
                    </Button>
                  )}
                </ShortFeedbackFormModalFooter>
              }
            >
              <ShortFeedbackForm
                closeModal={this.closeFeedbackModalSuccess}
                submitting={this.handleFeedbackOnSubmit}
                successfullySubmitted={this.handleFeedbackSubmitted}
              />
            </Modal>
          </>
        }

        <Inner className={showShortFeedback ? 'showShortFeedback' : ''}>
          <PagesNav>
            {LEGAL_PAGES.map((slug, index) => (
              <React.Fragment key={slug}>
                <StyledLink to={`/pages/${slug}`} className={index === 0 ? 'first' : ''}>
                  <FormattedMessage {...messages[slug]} />
                </StyledLink>
                <Bullet aria-hidden>•</Bullet>
              </React.Fragment>
            ))}
            <StyledButton onClick={this.openConsentManager}>
              <FormattedMessage {...messages.cookieSettings} />
            </StyledButton>
            <Bullet aria-hidden>•</Bullet>
            <StyledLink to="/site-map">
              <FormattedMessage {...messages.siteMap} />
            </StyledLink>
          </PagesNav>

          <Right>
            <PoweredBy>
              <PoweredByText>
                <FormattedMessage {...messages.poweredBy} />
              </PoweredByText>
              <CitizenlabLink href="https://www.citizenlab.co/">
                 <CitizenLabLogo name="citizenlab-footer-logo" title="CitizenLab" />
              </CitizenlabLink>
            </PoweredBy>

            <StyledSendFeedback showFeedbackText={smallerThanSmallTablet} />
          </Right>
        </Inner>
      </Container>
    );
  }
}

const Data = adopt<Props>({
  locale: <GetLocale />,
  windowSize: <GetWindowSize />
});

export default (inputProps: InputProps) => (
  <Data>
    {dataProps => <Footer {...inputProps} {...dataProps} />}
  </Data>
);

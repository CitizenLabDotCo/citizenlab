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
import { Icon } from 'cl2-component-library';

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
import GetWindowSize, {
  GetWindowSizeChildProps,
} from 'resources/GetWindowSize';

// style
import styled from 'styled-components';
import { rgba, transparentize } from 'polished';
import { media, colors, fontSizes, viewportWidths } from 'utils/styleUtils';

const Container = styled.footer<{ insideModal?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  position: relative;

  ${media.smallerThanMaxTablet`
    padding-bottom: ${({ insideModal, theme: { mobileMenuHeight } }) =>
      insideModal ? 0 : mobileMenuHeight}px;
  `}
`;

const Inner = styled.div`
  width: 100vw;
  min-height: ${(props) => props.theme.footerHeight}px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-left: 28px;
  padding-right: 28px;
  padding-top: 11px;
  padding-bottom: 11px;
  background: ${transparentize(0.1, colors.background)};
  border-top: solid 1px #ccc;
  overflow: hidden;

  ${media.smallerThan1280px`
    padding-left: 18px;
    padding-right: 18px;
  `}

  ${media.smallerThanMaxTablet`
    display: flex;
    flex-direction: column;
    justify-content: center;
  `}

  ${media.smallerThanMinTablet`
    padding: 15px 10px;
    border-top: solid 1px ${colors.separation};

    &.showShortFeedback {
      border-top: none;
    }
  `}
`;

const ShortFeedback = styled.div`
  display: flex;

  ${media.biggerThanMinTablet`
    position: absolute;
    z-index: 5;
    top: -36px;
    left: 20px;
  `}

  ${media.smallerThanMinTablet`
    border-top: solid 1px ${({ theme }) => rgba(theme.colorText, 0.3)};
    border-bottom: solid 1px ${({ theme }) => rgba(theme.colorText, 0.3)};
  `}
`;

const ShortFeedbackInner = styled.div`
  color: ${({ theme }) => theme.colorText};
  font-size: ${fontSizes.small}px;
  font-weight: 400;
  line-height: normal;
  display: flex;
  align-items: center;
  padding-top: 10px;
  padding-bottom: 10px;
  padding-left: 16px;
  padding-right: 16px;
  background: ${({ theme }) => rgba(theme.colorText, 0.09)};
  border-top-left-radius: 3px;
  border-top-right-radius: 3px;

  ${media.smallerThanMinTablet`
    width: 100%;
    justify-content: center;
    padding-left: 14px;
    padding-right: 14px;
  `}
`;

const ThankYouNote = styled.span`
  font-weight: 400;
`;

const FeedbackQuestion = styled.span`
  margin-right: 15px;
`;

const Buttons = styled.div`
  display: flex;
  align-items: center;
`;

const FeedbackButton = styled.button`
  color: ${({ theme }) => theme.colorText};
  font-weight: 500;
  text-align: left;
  text-transform: uppercase;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  margin: 0;
  z-index: 1;
  cursor: pointer;
  appearance: none;

  &.hasLeftMargin {
    margin-left: 14px;
  }

  &:hover {
    text-decoration: underline;
  }
`;

const PagesNav = styled.nav`
  ${media.smallerThanMaxTablet`
    width: 90vw;
    margin-top: 15px;
    margin-bottom: 15px;
  `}
`;

const PagesNavList = styled.ul`
  display: flex;

  align-items: center;
  list-style: none;
  margin: 0;
  padding: 0;

  ${media.smallerThanMaxTablet`
    flex-wrap: wrap;
    justify-content: center;
  `}

  & li {
    margin-right: 12px;

    &:after {
      color: ${colors.label};
      font-size: ${fontSizes.small}px;
      font-weight: 400;
      content: '•';
      margin-left: 12px;
    }

    &:last-child {
      margin-right: 0px;

      &:after {
        margin-left: 0px;
        content: '';
      }
    }
  }
`;

const PagesNavListItem = styled.li`
  color: ${colors.label};
  font-weight: 400;
  list-style: none;
  margin: 0;
  padding: 0;
`;

const StyledButton = styled.button`
  color: ${colors.label};
  font-weight: 400;
  font-size: ${fontSizes.small}px;
  line-height: normal;
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
  font-weight: 400;
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
  font-weight: 400;
  text-decoration: none;
  display: flex;
  align-items: center;
  outline: none;
  padding-right: 20px;
  margin-right: 24px;
  border-right: 2px solid ${colors.separation};

  ${media.smallerThan1280px`
    padding-right: 8px;
    margin-right: 13px;
  `}

  ${media.smallerThanMinTablet`
    flex-direction: column;
    padding: 0px;
    margin: 0px;
    margin-bottom: 15px;
    border: none;
  `}
`;

const PoweredByText = styled.span`
  color: ${colors.label};
  font-size: ${fontSizes.base}px;
  font-weight: 300;
  line-height: normal;
  margin-right: 8px;

  ${media.smallerThanMinTablet`
    margin-bottom: 10px;
  `}
`;

const CitizenlabLink = styled.a`
  width: 135px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 4px;
  cursor: pointer;
`;

const StyledSendFeedback = styled(SendFeedback)`
  ${media.smallerThanMinTablet`
    margin-top: 20px;
  `}
`;

const ShortFeedbackFormModalFooter = styled.div`
  display: flex;
`;

const CitizenLabLogo = styled(Icon)`
  height: 28px;
  fill: ${colors.label};

  &:hover {
    fill: #000;
  }
`;

interface InputProps {
  showShortFeedback?: boolean;
  className?: string;
  insideModal?: boolean;
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

class PlatformFooter extends PureComponent<Props, State> {
  static defaultProps = {
    showShortFeedback: true,
  };

  constructor(props) {
    super(props);
    this.state = {
      shortFeedbackButtonClicked: false,
      feedbackModalOpen: false,
      feedbackSubmitting: false,
      feedbackSubmitted: false,
    };
  }

  handleFeedbackButtonClick = (answer: 'yes' | 'no') => () => {
    this.setState({
      shortFeedbackButtonClicked: true,
    });

    // tracking
    if (answer === 'yes') {
      trackEventByName(tracks.clickShortFeedbackYes);
      postProductFeedback({
        question: 'found_what_youre_looking_for?',
        page: removeUrlLocale(location.pathname),
        locale: this.props.locale || undefined,
        answer: 'yes',
      }).catch((err) => {
        reportError(err);
      });
    } else if (answer === 'no') {
      trackEventByName(tracks.clickShortFeedbackNo);
      this.openFeedbackModal();
    }
  };

  openFeedbackModal = () => {
    this.setState({ feedbackModalOpen: true });
  };

  closeFeedbackModal = () => {
    this.setState({ feedbackModalOpen: false });
  };

  closeFeedbackModalSuccess = () => {
    this.setState({ feedbackModalOpen: false });
  };

  handleFeedbackOnSubmit = (submitting: boolean) => {
    this.setState({ feedbackSubmitting: submitting });
  };

  handleFeedbackSubmitted = () => {
    this.setState({ feedbackSubmitted: true });
  };

  closeFeedbackModalCancel = () => {
    this.setState({ feedbackModalOpen: false });

    postProductFeedback({
      question: 'found_what_youre_looking_for?',
      page: removeUrlLocale(location.pathname),
      locale: this.props.locale || undefined,
      answer: 'no',
    }).catch((err) => reportError(err));
  };

  shortFeedbackFormOnSubmit = () => {
    eventEmitter.emit('ShortFeedbackFormSubmitEvent');
  };

  openConsentManager = () => {
    eventEmitter.emit('openConsentManager');
  };

  render() {
    const {
      shortFeedbackButtonClicked,
      feedbackModalOpen,
      feedbackSubmitting,
      feedbackSubmitted,
    } = this.state;
    const {
      showShortFeedback,
      className,
      windowSize,
      insideModal,
    } = this.props;
    const smallerThanSmallTablet = windowSize
      ? windowSize <= viewportWidths.smallTablet
      : false;

    return (
      <Container
        insideModal={insideModal}
        id="hook-footer"
        className={className}
      >
        {showShortFeedback && (
          <>
            <ShortFeedback>
              <ShortFeedbackInner>
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
                    <Buttons>
                      <FeedbackButton
                        onClick={this.handleFeedbackButtonClick('yes')}
                      >
                        <FormattedMessage {...messages.yes} />
                      </FeedbackButton>
                      <FeedbackButton
                        className="hasLeftMargin"
                        onClick={this.handleFeedbackButtonClick('no')}
                      >
                        <FormattedMessage {...messages.no} />
                      </FeedbackButton>
                    </Buttons>
                  </>
                )}
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
                    <Button
                      onClick={this.shortFeedbackFormOnSubmit}
                      processing={feedbackSubmitting}
                    >
                      <FormattedMessage {...messages.submit} />
                    </Button>
                  ) : (
                    <Button
                      buttonStyle="secondary"
                      onClick={this.closeFeedbackModal}
                    >
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
        )}

        <Inner className={showShortFeedback ? 'showShortFeedback' : ''}>
          <PagesNav>
            <PagesNavList>
              {LEGAL_PAGES
                // to be added back when we do the footer redesign
                .filter((slug) => slug !== 'accessibility-statement')
                .map((slug, index) => (
                  <React.Fragment key={slug}>
                    <PagesNavListItem>
                      <StyledLink
                        to={`/pages/${slug}`}
                        className={index === 0 ? 'first' : ''}
                      >
                        <FormattedMessage {...messages[slug]} />
                      </StyledLink>
                    </PagesNavListItem>
                  </React.Fragment>
                ))}
              <PagesNavListItem>
                <StyledButton onClick={this.openConsentManager}>
                  <FormattedMessage {...messages.cookieSettings} />
                </StyledButton>
              </PagesNavListItem>
              <PagesNavListItem>
                <StyledLink to="/site-map">
                  <FormattedMessage {...messages.siteMap} />
                </StyledLink>
              </PagesNavListItem>
            </PagesNavList>
          </PagesNav>

          <Right>
            <PoweredBy>
              <PoweredByText>
                <FormattedMessage {...messages.poweredBy} />
              </PoweredByText>
              <CitizenlabLink href="https://www.citizenlab.co/">
                <CitizenLabLogo
                  name="citizenlab-footer-logo"
                  title="CitizenLab"
                />
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
  windowSize: <GetWindowSize />,
});

export default (inputProps: InputProps) => (
  <Data>
    {(dataProps) => <PlatformFooter {...inputProps} {...dataProps} />}
  </Data>
);

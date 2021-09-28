import React, { useState } from 'react';
import { reportError } from 'utils/loggingUtils';
import { isNilOrError } from 'utils/helperUtils';
import { isEmpty } from 'lodash-es';

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
import { FormattedMessage, MessageDescriptor } from 'utils/cl-intl';
import messages from './messages';

// tracking
import { trackEventByName } from 'utils/analytics';
import tracks from './tracks';

// services
import { removeUrlLocale } from 'services/locale';
import { FOOTER_PAGES, TFooterPage } from 'services/pages';

// style
import styled, { css } from 'styled-components';
import { transparentize } from 'polished';
import {
  media,
  colors,
  fontSizes,
  viewportWidths,
  isRtl,
} from 'utils/styleUtils';

// hooks
import useAppConfiguration from 'hooks/useAppConfiguration';
import useWindowSize from 'hooks/useWindowSize';
import useLocale from 'hooks/useLocale';
import useFeatureFlag from 'hooks/useFeatureFlag';

const Container = styled.footer<{ insideModal?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  position: relative;

  ${media.smallerThanMaxTablet`
    margin-top: 0px;
    padding-bottom: ${({ insideModal, theme: { mobileMenuHeight } }) =>
      insideModal ? 0 : mobileMenuHeight}px;
  `}
`;

const ShortFeedbackContainer = styled.div`
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

const ShortFeedback = styled.div`
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

const ThankYouNote = styled.span`
  color: ${({ theme }) => theme.colorText};
  font-size: ${fontSizes.small}px;
  font-weight: 400;
  line-height: normal;
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

const FooterContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-left: 28px;
  padding-right: 28px;
  padding-top: 11px;
  padding-bottom: 11px;
  background: #fff;
  border-top: solid 1px #ccc;
  overflow: hidden;

  ${media.smallerThanMaxTablet`
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 15px 10px;
    background: #f4f4f4;
  `}
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
  flex-wrap: wrap;
  align-items: center;
  list-style: none;
  margin: 0;
  padding: 0;

  ${media.smallerThanMaxTablet`
    flex-wrap: wrap;
    justify-content: center;
  `}

  & li {
    margin-right: 10px;

    &:after {
      color: ${colors.label};
      font-size: ${fontSizes.small}px;
      font-weight: 400;
      content: '•';
      margin-left: 10px;
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
  font-size: ${fontSizes.small}px;
  line-height: normal;
  font-weight: 400;
  list-style: none;
  margin: 0;
  padding: 0;
`;

const StyledButton = styled.button`
  color: ${colors.label};
  font-size: ${fontSizes.small}px;
  font-weight: 400;
  line-height: normal;
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

const linkStyle = css`
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

const StyledLink = styled(Link)`
  ${linkStyle}
`;

const StyledA = styled.a`
  ${linkStyle}
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
  display: flex;
  align-items: center;
  outline: none;
  padding-right: 20px;
  margin-right: 24px;
  border-right: 2px solid ${colors.separation};

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
  font-size: ${fontSizes.small}px;
  font-weight: 400;
  line-height: normal;
  margin-right: 8px;

  ${media.smallerThan1280px`
    display: none;
  `}

  ${media.smallerThanMaxTablet`
    display: block;
  `}

  ${media.smallerThanMinTablet`
    margin-bottom: 10px;
  `}
`;

const CitizenlabLink = styled.a`
  width: 130px;
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

interface Props {
  showShortFeedback?: boolean;
  className?: string;
  insideModal?: boolean;
}

type TMessagesMap = { [key in TFooterPage]: MessageDescriptor };

const MESSAGES_MAP: TMessagesMap = {
  information: messages.information,
  'terms-and-conditions': messages.termsAndConditions,
  'privacy-policy': messages.privacyPolicy,
  'cookie-policy': messages.cookiePolicy,
  faq: messages.faq,
  'accessibility-statement': messages.accessibilityStatement,
};

const PlatformFooter = ({
  showShortFeedback = true,
  className,
  insideModal,
}: Props) => {
  const appConfiguration = useAppConfiguration();
  const windowSize = useWindowSize();
  const locale = useLocale();
  const customizedA11yHrefEnabled = useFeatureFlag(
    'custom_accessibility_statement_link'
  );

  const [shortFeedbackButtonClicked, setShortFeedbackButtonClicked] = useState(
    false
  );
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

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

  const openConsentManager = () => {
    eventEmitter.emit('openConsentManager');
  };

  const getHasCustomizedA11yFooterLink = () => {
    return (
      !isNilOrError(appConfiguration) &&
      customizedA11yHrefEnabled &&
      !isEmpty(
        appConfiguration.data.attributes.settings
          .custom_accessibility_statement_link.url
      )
    );
  };

  const getCustomizedA11yHref = () => {
    if (isNilOrError(appConfiguration) || !getHasCustomizedA11yFooterLink()) {
      return null;
    }

    return appConfiguration.data.attributes.settings
      .custom_accessibility_statement_link.url;
  };

  const smallerThanSmallTablet =
    windowSize.windowWidth <= viewportWidths.smallTablet;
  const hasCustomizedA11yFooterLink = getHasCustomizedA11yFooterLink();
  const customizedA11yHref = getCustomizedA11yHref();

  return (
    <Container insideModal={insideModal} id="hook-footer" className={className}>
      {showShortFeedback && (
        <>
          <ShortFeedbackContainer>
            <ShortFeedback>
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
            </ShortFeedback>
          </ShortFeedbackContainer>

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
        </>
      )}

      <FooterContainer className={showShortFeedback ? 'showShortFeedback' : ''}>
        <PagesNav>
          <PagesNavList>
            {FOOTER_PAGES.map((slug: TFooterPage, index) => {
              return (
                <React.Fragment key={slug}>
                  <PagesNavListItem>
                    {slug === 'accessibility-statement' &&
                    hasCustomizedA11yFooterLink &&
                    customizedA11yHref ? (
                      <StyledA
                        href={customizedA11yHref}
                        target={hasCustomizedA11yFooterLink && '_blank'}
                        className={index === 0 ? 'first' : ''}
                      >
                        <FormattedMessage {...MESSAGES_MAP[slug]} />
                      </StyledA>
                    ) : (
                      <StyledLink
                        to={`/pages/${slug}`}
                        className={index === 0 ? 'first' : ''}
                      >
                        <FormattedMessage {...MESSAGES_MAP[slug]} />
                      </StyledLink>
                    )}
                  </PagesNavListItem>
                </React.Fragment>
              );
            })}
            <PagesNavListItem>
              <StyledButton onClick={openConsentManager}>
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
            <CitizenlabLink href="https://www.citizenlab.co/" target="_blank">
              <CitizenLabLogo
                name="citizenlab-footer-logo"
                title="CitizenLab"
              />
            </CitizenlabLink>
          </PoweredBy>

          <StyledSendFeedback showFeedbackText={smallerThanSmallTablet} />
        </Right>
      </FooterContainer>
    </Container>
  );
};

export default PlatformFooter;

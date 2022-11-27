import React from 'react';
import { isEmpty } from 'lodash-es';
import { isNilOrError } from 'utils/helperUtils';

// components
import Button from 'components/UI/Button';
import Avatar from 'components/Avatar';
import { Image } from '@citizenlab/cl2-component-library';
import CompleteProfileStep from './CompleteProfileStep';

// services
import {
  dismissOnboardingCampaign,
  OnboardingCampaignName,
} from 'services/onboardingCampaigns';

// utils
import CSSTransition from 'react-transition-group/CSSTransition';
import { openVerificationModal } from 'events/verificationModal';

// tracking
import { trackEventByName } from 'utils/analytics';
import tracks from '../tracks';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';
import T from 'components/T';

// style
import styled, { useTheme } from 'styled-components';
import { ScreenReaderOnly } from 'utils/a11y';
import { media, fontSizes, isRtl } from 'utils/styleUtils';
import Outlet from 'components/Outlet';
import VerificationOnboardingStep from '../VerificationOnboardingStep';

// hooks
import useAppConfiguration from 'hooks/useAppConfiguration';
import useAuthUser from 'hooks/useAuthUser';
import useOnboardingCampaign from 'hooks/useOnboardingCampaign';
import useHomepageSettings from 'hooks/useHomepageSettings';

const contentTimeout = 350;
const contentEasing = 'cubic-bezier(0.19, 1, 0.22, 1)';
const contentDelay = 550;

const Header = styled.div`
  width: 100%;
  height: 190px;
  position: relative;
  display: flex;
  flex-direction: column;

  ${media.tablet`
    height: 320px;
  `}

  ${media.phone`
    height: 400px;
  `}
`;

const HeaderImageContainer = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
`;

const HeaderImageContainerInner = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  position: relative;

  ${isRtl`
    flex-direction: row-reverse;
  `}
`;

const HeaderImage = styled(Image)`
  width: 100%;
  height: auto;

  ${media.tablet`
    &.objectFitCoverSupported {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    &:not(.objectFitCoverSupported) {
      width: auto;
      height: 100%;
    }
  `}
`;

const HeaderImageOverlay = styled.div`
  background: ${({ theme }) =>
    theme.signedInHeaderOverlayColor || theme.colors.tenantPrimary};
  opacity: ${({ theme }) => theme.signedInHeaderOverlayOpacity / 100};
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
`;

const HeaderContent = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 20px;
  padding-bottom: 20px;
  padding-left: 75px;
  padding-right: 75px;
  overflow: hidden;

  ${isRtl`
    flex-direction: row-reverse;
  `}

  &.content-enter {
    opacity: 0;

    &.content-enter-active {
      opacity: 1;
      transition: all ${contentTimeout}ms ${contentEasing} ${contentDelay}ms;
    }
  }

  &.content-enter-done {
    opacity: 1;
  }

  &.content-exit {
    opacity: 1;
    transition: all ${contentTimeout}ms ${contentEasing};

    &.content-exit-active {
      opacity: 0;
    }
  }

  &.content-exit-done {
    display: none;
  }

  h2 {
    color: #fff;
    font-size: ${fontSizes.xxl}px;
    line-height: 33px;
    font-weight: 400;
  }

  ${media.tablet`
    padding-left: 30px;
    padding-right: 30px;
  `}

  ${media.tablet`
    flex-direction: column;
    align-items: stretch;
    justify-content: center;
    padding-left: 15px;
  `}
`;

export const HeaderContentCompleteProfile = styled(HeaderContent)``;
const HeaderContentCustomCta = styled(HeaderContent)``;
const HeaderContentDefault = styled(HeaderContent)`
  justify-content: center;

  h2 {
    text-align: center;
  }

  ${media.tablet`
    align-items: center;
  `}
`;

export const Left = styled.div`
  display: flex;
  align-items: center;
  margin-right: 60px;

  ${isRtl`
    flex-direction: row-reverse;
  `}

  ${media.tablet`
    margin-right: 0;
    flex-direction: column;
    align-items: flex-start;
  `}

  ${media.phone`
    align-items: center;
    margin-bottom: 30px;
  `}
`;

export const Icons = styled.div`
  display: flex;
  margin-right: 30px;

  ${isRtl`
    margin-right: 0px;
    margin-left: 30px;
  `}

  ${media.phone`
    margin-right: 0;
  `}
`;

export const Text = styled.div`
  ${isRtl`
    direction: rtl;
  `}

  ${media.phone`
    text-align: center;
  `}
`;

export const Right = styled.div`
  display: flex;

  ${isRtl`
    flex-direction: row-reverse;
  `}

  ${media.phone`
    flex-direction: column;
  `}
`;

export const SkipButton = styled(Button)`
  margin-right: 10px;

  ${media.tablet`
    order: 2;
    margin-right: 0px;
  `}

  ${isRtl`
    margin-right: 0px;
    margin-left: 10px;
  `}
`;

export const AcceptButton = styled(Button)`
  ${media.tablet`
    order: 1;
    margin-right: 10px;
  `}

  ${media.phone`
    margin-bottom: 10px;
    margin-right: 0px;
  `}
`;

export const AvatarAndShield = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const StyledAvatar = styled(Avatar)`
  margin-right: -3px;
  z-index: 2;
`;

interface Props {
  className?: string;
}

const SignedInHeader = ({ className }: Props) => {
  const homepageSettings = useHomepageSettings();
  const appConfiguration = useAppConfiguration();
  const authUser = useAuthUser();
  const onboardingCampaign = useOnboardingCampaign();

  const theme = useTheme();
  const handleSkip = (name: OnboardingCampaignName) => () => {
    trackEventByName(tracks.clickSkipButton, {
      extra: { location: 'signed-in header', context: name },
    });
    dismissOnboardingCampaign(name);
  };

  const handleAccept = (name: OnboardingCampaignName) => () => {
    if (name === 'verification') {
      openVerificationModal();
    }
  };

  if (
    !isNilOrError(appConfiguration) &&
    !isNilOrError(authUser) &&
    !isNilOrError(onboardingCampaign) &&
    !isNilOrError(homepageSettings)
  ) {
    const tenantHeaderImage = homepageSettings.attributes.header_bg
      ? homepageSettings.attributes.header_bg.large
      : null;
    const defaultMessage =
      homepageSettings.attributes.banner_signed_in_header_multiloc;

    const objectFitCoverSupported =
      window['CSS'] && CSS.supports('object-fit: cover');

    const genericTitle = (
      <FormattedMessage tagName="h1" {...messages.titleCity} />
    );
    const onboardingCampaignName = onboardingCampaign.data.attributes.name;

    return (
      <Header className={`e2e-signed-in-header ${className}`} id="hook-header">
        <ScreenReaderOnly>
          {defaultMessage ? (
            <T as="h1" value={defaultMessage}>
              {(translatedTitle) =>
                translatedTitle ? <h1>{translatedTitle}</h1> : genericTitle
              }
            </T>
          ) : (
            genericTitle
          )}
        </ScreenReaderOnly>
        <HeaderImageContainer>
          <HeaderImageContainerInner>
            {tenantHeaderImage && (
              <HeaderImage
                alt="" // Image is decorative, so alt tag is empty
                src={tenantHeaderImage}
                className={
                  objectFitCoverSupported ? 'objectFitCoverSupported' : ''
                }
              />
            )}
            <HeaderImageOverlay />
          </HeaderImageContainerInner>
        </HeaderImageContainer>

        <CompleteProfileStep
          activeOnboardingCampaignName={onboardingCampaignName}
          onSkip={handleSkip('complete_profile')}
        />

        <VerificationOnboardingStep
          verificationCampaignIsActive={
            onboardingCampaignName === 'verification'
          }
          contentTimeout={contentTimeout}
          contentDelay={contentDelay}
          authUser={authUser}
          onSkip={handleSkip(onboardingCampaignName)}
          onAccept={handleAccept(onboardingCampaignName)}
        />

        {/* Second header state - custom CTA */}
        <CSSTransition
          classNames="content"
          in={onboardingCampaignName === 'custom_cta'}
          timeout={
            onboardingCampaignName === 'custom_cta'
              ? contentTimeout + contentDelay
              : contentTimeout
          }
          mountOnEnter={true}
          unmountOnExit={true}
          enter={true}
          exit={true}
        >
          <HeaderContentCustomCta id="e2e-signed-in-header-custom-cta">
            <Left>
              <Text>
                <T
                  as="h2"
                  value={
                    onboardingCampaign.data.attributes.cta_message_multiloc
                  }
                  supportHtml
                />
              </Text>
            </Left>

            <Right>
              <SkipButton
                buttonStyle="primary-outlined"
                text={<FormattedMessage {...messages.doItLater} />}
                onClick={handleSkip(onboardingCampaignName)}
                borderColor="#fff"
                textColor="#fff"
                fontWeight="500"
              />
              <AcceptButton
                text={
                  <T
                    value={
                      onboardingCampaign.data.attributes.cta_button_multiloc
                    }
                  />
                }
                linkTo={onboardingCampaign.data.attributes.cta_button_link}
                buttonStyle="primary-inverse"
                textColor={theme.colors.tenantPrimary}
                textHoverColor={theme.colors.tenantPrimary}
                fontWeight="500"
              />
            </Right>
          </HeaderContentCustomCta>
        </CSSTransition>

        {/* Third header state - default customizable message */}
        <CSSTransition
          classNames="content"
          in={onboardingCampaignName === 'default'}
          timeout={
            onboardingCampaignName === 'default'
              ? contentTimeout + contentDelay
              : contentTimeout
          }
          mountOnEnter={true}
          unmountOnExit={true}
          enter={true}
          exit={true}
        >
          <HeaderContentDefault id="e2e-signed-in-header-default-cta">
            <Left>
              {defaultMessage && !isEmpty(defaultMessage) ? (
                <T as="h2" value={defaultMessage} supportHtml />
              ) : (
                <FormattedMessage
                  {...messages.defaultSignedInMessage}
                  tagName="h2"
                  values={{ firstName: authUser.attributes.first_name }}
                />
              )}
            </Left>
            <Right>
              <Outlet
                id="app.containers.HomePage.SignedInHeader.CTA"
                buttonStyle="primary-inverse"
              />
            </Right>
          </HeaderContentDefault>
        </CSSTransition>
      </Header>
    );
  }

  return null;
};

export default SignedInHeader;

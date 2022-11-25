import React from 'react';
import { adopt } from 'react-adopt';
import { isEmpty } from 'lodash-es';
import { isNilOrError } from 'utils/helperUtils';

// components
import Button from 'components/UI/Button';
import Avatar from 'components/Avatar';
import { Icon, Image } from '@citizenlab/cl2-component-library';

// services
import {
  dismissOnboardingCampaign,
  IOnboardingCampaignNames,
} from 'services/onboardingCampaigns';

// resources
import GetAppConfiguration, {
  GetAppConfigurationChildProps,
} from 'resources/GetAppConfiguration';
import GetAuthUser, { GetAuthUserChildProps } from 'resources/GetAuthUser';
import GetOnboardingCampaigns, {
  GetOnboardingCampaignsChildProps,
} from 'resources/GetOnboardingCampaigns';

// utils
import CSSTransition from 'react-transition-group/CSSTransition';
import { openVerificationModal } from 'events/verificationModal';

// tracking
import { trackEventByName } from 'utils/analytics';
import tracks from './tracks';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';
import T from 'components/T';

// style
import styled, { useTheme } from 'styled-components';
import { ScreenReaderOnly } from 'utils/a11y';
import { media, fontSizes, isRtl } from 'utils/styleUtils';
import Outlet from 'components/Outlet';
import { IHomepageSettingsData } from 'services/homepageSettings';
import VerificationOnboardingStep from './VerificationOnboardingStep';

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
    padding-right: 15px;
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
`;

export const Icons = styled.div`
  display: flex;
  margin-right: 30px;

  ${isRtl`
    margin-right: 0px;
    margin-left: 30px;
  `}
`;

const CompleteProfileIcon = styled(Icon)`
  width: 50px;
  height: 50px;
  margin-left: -3px;
  opacity: 0.5;
`;

export const Text = styled.div`
  ${isRtl`
    direction: rtl;
  `}
`;

export const Right = styled.div`
  display: flex;

  ${isRtl`
    flex-direction: row-reverse;
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

interface InputProps {
  className?: string;
  homepageSettings: Error | IHomepageSettingsData | null;
}

interface DataProps {
  tenant: GetAppConfigurationChildProps;
  authUser: GetAuthUserChildProps;
  onboardingCampaigns: GetOnboardingCampaignsChildProps;
}

interface Props extends InputProps, DataProps {}

const SignedInHeader = ({
  tenant,
  authUser,
  className,
  onboardingCampaigns,
  homepageSettings,
}: Props) => {
  const theme = useTheme();
  const handleSkip = (name: IOnboardingCampaignNames) => () => {
    trackEventByName(tracks.clickSkipButton, {
      extra: { location: 'signed-in header', context: name },
    });
    dismissOnboardingCampaign(name);
  };

  const handleAccept = (name: IOnboardingCampaignNames) => () => {
    if (name === 'verification') {
      openVerificationModal();
    }
  };

  if (
    !isNilOrError(tenant) &&
    !isNilOrError(authUser) &&
    !isNilOrError(onboardingCampaigns) &&
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

        {/* First header state - complete profile */}
        <CSSTransition
          classNames="content"
          in={onboardingCampaigns.name === 'complete_profile'}
          timeout={
            onboardingCampaigns.name === 'complete_profile'
              ? contentTimeout + contentDelay
              : contentTimeout
          }
          mountOnEnter={true}
          unmountOnExit={true}
          enter={true}
          exit={true}
        >
          <HeaderContentCompleteProfile id="e2e-signed-in-header-complete-profile">
            <Left>
              <Icons>
                <StyledAvatar
                  userId={authUser?.id}
                  size={50}
                  fillColor="#fff"
                  padding={0}
                  borderThickness={0}
                />
                <CompleteProfileIcon name="edit" fill="#fff" ariaHidden />
              </Icons>
              <Text>
                <FormattedMessage
                  {...messages.completeYourProfile}
                  tagName="h2"
                  values={{ firstName: authUser.attributes.first_name }}
                />
              </Text>
            </Left>

            <Right>
              <SkipButton
                buttonStyle="primary-outlined"
                text={<FormattedMessage {...messages.doItLater} />}
                onClick={handleSkip(onboardingCampaigns.name)}
                borderColor="#fff"
                textColor="#fff"
                fontWeight="500"
                className="e2e-signed-in-header-complete-skip-btn"
              />
              <AcceptButton
                text={<FormattedMessage {...messages.completeProfile} />}
                buttonStyle="primary-inverse"
                linkTo="/profile/edit"
                textColor={theme.colors.tenantPrimary}
                textHoverColor={theme.colors.tenantPrimary}
                fontWeight="500"
                className="e2e-signed-in-header-accept-btn"
              />
            </Right>
          </HeaderContentCompleteProfile>
        </CSSTransition>

        <VerificationOnboardingStep
          onboardingCampaigns={onboardingCampaigns}
          contentTimeout={contentTimeout}
          contentDelay={contentDelay}
          authUser={authUser}
          onSkip={handleSkip(onboardingCampaigns.name)}
          onAccept={handleAccept(onboardingCampaigns.name)}
        />

        {/* Second header state - custom CTA */}
        <CSSTransition
          classNames="content"
          in={onboardingCampaigns.name === 'custom_cta'}
          timeout={
            onboardingCampaigns.name === 'custom_cta'
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
                  value={onboardingCampaigns.cta_message_multiloc}
                  supportHtml
                />
              </Text>
            </Left>

            <Right>
              <SkipButton
                buttonStyle="primary-outlined"
                text={<FormattedMessage {...messages.doItLater} />}
                onClick={handleSkip(onboardingCampaigns.name)}
                borderColor="#fff"
                textColor="#fff"
                fontWeight="500"
              />
              <AcceptButton
                text={<T value={onboardingCampaigns.cta_button_multiloc} />}
                linkTo={onboardingCampaigns.cta_button_link}
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
          in={onboardingCampaigns.name === 'default'}
          timeout={
            onboardingCampaigns.name === 'default'
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

const Data = adopt<DataProps, InputProps>({
  tenant: <GetAppConfiguration />,
  authUser: <GetAuthUser />,
  onboardingCampaigns: <GetOnboardingCampaigns />,
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {(dataProps) => <SignedInHeader {...inputProps} {...dataProps} />}
  </Data>
);

import React, { PureComponent } from 'react';
import { adopt } from 'react-adopt';
import clHistory from 'utils/cl-router/history';
import { isNilOrError } from 'utils/helperUtils';

// components
import Button from 'components/UI/Button';
import Icon from 'components/UI/Icon';
import ContentContainer from 'components/ContentContainer';

// resources
import GetLocale, { GetLocaleChildProps } from 'resources/GetLocale';
import GetTenant, { GetTenantChildProps } from 'resources/GetTenant';
import GetAuthUser, { GetAuthUserChildProps } from 'resources/GetAuthUser';
import GetOnboardingStatus, { GetOnboardingStatusChildProps } from 'resources/GetOnboardingStatus';

// utils
import { trackEvent } from 'utils/analytics';
import tracks from './tracks';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';
import T from 'components/T';

// style
import styled, { withTheme } from 'styled-components';
import { media, fontSizes } from 'utils/styleUtils';

const Header = styled.div`
  width: 100%;
  height: 195px;
  position: relative;

  ${media.largePhone`
    height: 250px;
  `}
`;

const HeaderImageContainer = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
`;

const HeaderImage = styled.img`
  width: 100%;
  min-height: 250px;
`;

const HeaderImageOverlay = styled.div`
  background: ${(props) => props.theme.colorMain};
  opacity: 0.9;
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
`;

const StyledContentContainer = styled(ContentContainer)`
  height: 100%;

  & > .inner {
    height: 100%;
  }
`;

const Content = styled.div`
  height: 100%;
  display: flex;
  align-items: center;
  padding: 0 20px;
  justify-content: center;

  ${media.smallerThanMinTablet`
    flex-direction: column;
    align-items: stretch;
  `}

  p {
    color: #fff;
    font-size: ${fontSizes.xxl}px;
    line-height: 31px;
    font-weight: 400;
    &.center {
        text-align: center;
      }
  }
`;

const Left = styled.div`
  flex-grow: 1;
  flex-shrink: 1;
  flex-basis: 0;
  display: flex;
  align-items: center;
  margin-right: 60px;

  ${media.smallerThanMinTablet`
    flex-basis: auto;
    flex-grow: 0;
    margin-right: 0;
  `}
`;

const Icons = styled.div`
  display: flex;
  margin-right: 40px;

  ${media.smallerThanMinTablet`
    display: none;
  `}

  svg:last-child {
    margin-left: -7px;
    z-index: -1;
  }
`;

const NoAvatarUserIcon: any = styled(Icon)`
  fill: #fff;
  background: ${props => props.theme.colorMain};
  border-radius: 50%;
  width: 50px;
  height: 50px;
`;

const CompleteProfileIcon = styled(Icon)`
  width: 50px;
  height: 50px;
`;

const Text = styled.div`
  flex-grow: 1;
  flex-shrink: 1;
  flex-basis: 0;
  display: flex;
  ${media.smallerThanMinTablet`
    flex-basis: auto;
    flex-direction: column;
    align-items: flex-start;
    justify-content: flex-start;
  `}
`;

const Right = styled.div`
  display: flex;

  ${media.smallerThanMaxTablet`
    margin-top: 30px;
  `}

  ${media.largePhone`
    flex-direction: column;
    align-items: flex-start;
    justify-content: flex-start;
  `}
`;

const SkipButton = styled(Button)`
  margin-right: 10px;

  ${media.largePhone`
    order: 2;
    margin-right: 0px;
  `}
`;

const AcceptButton = styled(Button)`
  ${media.largePhone`
    order: 1;
    margin-bottom: 10px;
  `}
`;

export interface InputProps {
  className?: string;
}

interface DataProps {
  locale: GetLocaleChildProps;
  tenant: GetTenantChildProps;
  authUser: GetAuthUserChildProps;
  onboardingStatus: GetOnboardingStatusChildProps;
}

interface Props extends InputProps, DataProps {
  theme: any;
}

interface State { }

class SignedInHeader extends PureComponent<Props, State> {
  goToSignUpPage = () => {
    trackEvent({ ...tracks.clickCreateAccountCTA, properties: { extra: { location: 'header' } } });
    clHistory.push('/sign-up');
  }

  handleSkipButtonClick = () => {

  }

  handleSubmitButtonClick = () => {

  }

  render() {
    const { locale, tenant, authUser, className, onboardingStatus } = this.props;

    if (!isNilOrError(locale) && !isNilOrError(tenant) && !isNilOrError(authUser)) {
      const tenantHeaderImage = (tenant.attributes.header_bg ? tenant.attributes.header_bg.large : null);

      if (onboardingStatus) {
        return (
          <Header className={className} id="hook-header">
            <HeaderImageContainer>
              {tenantHeaderImage && <HeaderImage src={tenantHeaderImage} />}
              <HeaderImageOverlay />
            </HeaderImageContainer>

            <HeaderContent>
              <StyledContentContainer mode="banner">
                <Content>
                  {/* First header state - complete profile */}
                  {onboardingStatus.status === 'complete_profile' &&
                    <>
                      <Left>
                        <Icons>
                          <NoAvatarUserIcon name="noAvatar" />
                          <CompleteProfileIcon name="completeProfile" />
                        </Icons>
                        <Text>
                          <FormattedMessage {...messages.completeYourProfile} tagName="p" values={{ firstName: authUser.attributes.first_name }} />
                        </Text>
                      </Left>

                      <Right>
                        <SkipButton
                          style="primary-outlined"
                          text={<FormattedMessage {...messages.doItLater} />}
                          onClick={this.handleSkipButtonClick}
                          borderColor="#fff"
                          textColor="#fff"
                        />
                        <AcceptButton
                          text={<FormattedMessage {...messages.completeProfile} />}
                          linkTo="/profile/edit"
                          bgColor="#fff"
                          textColor={this.props.theme.colorMain}
                        />
                      </Right>
                    </>
                  }

                  {/* Second header state - custom CTA */}
                  {onboardingStatus.status === 'custom_cta' &&
                    <>
                      <Left>
                        <Text>
                          <T as="p" value={onboardingStatus.cta_message_multiloc} />
                        </Text>
                      </Left>

                      <Right>
                        {/* TODO missing field in the backend
                        <SkipButton
                          style="primary-outlined"
                          text={<T value={onboardingStatus.cta_button_multiloc} />}
                          onClick={this.handleSkipButtonClick}
                          borderColor="#fff"
                          textColor="#fff"
                        />*/}
                        <SkipButton
                          style="primary-outlined"
                          text={<FormattedMessage {...messages.doItLater} />}
                          onClick={this.handleSkipButtonClick}
                          borderColor="#fff"
                          textColor="#fff"
                        />
                        <AcceptButton
                          text={<T value={onboardingStatus.cta_button_multiloc} />}
                          linkTo={onboardingStatus.cta_button_link}
                          bgColor="#fff"
                          textColor={this.props.theme.colorMain}
                        />
                      </Right>
                    </>
                  }

                  {/* Third header state - default customizable message */}
                  {onboardingStatus.status === 'default' &&
                    <T as="p" value={onboardingStatus.cta_message_multiloc} className="center" />
                  }
                </Content>
              </StyledContentContainer>
            </HeaderContent>
          </Header>
        );
      }
    }

    return null;
  }
}

const Data = adopt<DataProps, InputProps>({
  locale: <GetLocale />,
  tenant: <GetTenant />,
  authUser: <GetAuthUser />,
  onboardingStatus: <GetOnboardingStatus />
});

const SignedInHeaderWithHoC = withTheme<Props, State>(SignedInHeader);

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {dataProps => <SignedInHeaderWithHoC {...inputProps} {...dataProps} />}
  </Data>
);

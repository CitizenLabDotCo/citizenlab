import React, { PureComponent } from 'react';
import { adopt } from 'react-adopt';
import clHistory from 'utils/cl-router/history';
import { isNilOrError } from 'utils/helperUtils';
import { openSignUpInModal } from 'components/SignUpIn/events';
import Tippy from '@tippyjs/react';

// components
import Button from 'components/UI/Button';
import { Icon } from 'cl2-component-library';
import AvatarBubbles from 'components/AvatarBubbles';
import InitiativeInfoContent from './InitiativeInfoContent';

// resources
import GetAuthUser, { GetAuthUserChildProps } from 'resources/GetAuthUser';
import GetTenant, { GetTenantChildProps } from 'resources/GetTenant';

// tracking
import { trackEventByName } from 'utils/analytics';
import tracks from './tracks';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// style
import styled from 'styled-components';
import { media, fontSizes, colors } from 'utils/styleUtils';
import { ScreenReaderOnly } from 'utils/a11y';
import T from 'components/T';

// images
import illustrationSrc from './initiativesHeaderImage.jpg';

const Container = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;

  ${media.smallerThanMinTablet`
    background-color: ${colors.background};
  `}
`;

const Header = styled.div`
  width: 100%;
  min-height: 350px;
  padding: 20px 15px;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  ${media.smallerThanMinTablet`
    min-height: 300px;
  `}
`;

const HeaderContent = styled.div`
  width: 100%;
  height: 100%;
  max-width: ${(props) => props.theme.maxPageWidth + 60}px;
  padding-top: 50px;
  padding-left: 30px;
  padding-right: 30px;
  padding-bottom: 50px;
  ${media.smallerThanMinTablet`
    padding-bottom: 20px;
  `}
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 1;
`;

const HeaderTitle = styled.h2`
  color: ${({ theme }) => theme.colorText};
  font-size: ${({ theme }) => theme.signedOutHeaderTitleFontSize || fontSizes.xxxxl}px;
  font-weight: ${({ theme }) => theme.signedOutHeaderTitleFontWeight || 600};
  line-height: normal;
  text-align: center;
  width: 100%;
  max-width: 600px;
  margin: 0;
  padding: 0;
  margin-bottom: 18px;

  ${media.smallerThanMaxTablet`
    font-size: ${fontSizes.xxxl}px;
  `}
`;

const StyledAvatarBubbles = styled(AvatarBubbles)`
  min-height: 40px;
  margin-bottom: 18px;
`;

const StartInitiativeButton = styled(Button)``;

const InitiativeInfo = styled.div`
  width: 100%;
  min-height: 145px;
  height: auto;
  margin: 0;
  padding: 0;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 1px solid ${colors.separation};
  border-left: none;
  border-right: none;
  background: white;
  line-height: ${fontSizes.xl}px;

  ${media.smallerThanMaxTablet`
    padding: 40px 0;
  `}

  ${media.smallerThanMinTablet`
    margin-bottom: 40px;
  `}
`;

const Wrapper = styled.div`
  width: auto;
  max-width: 1150px;
  height: 100%;
  font-size: ${fontSizes.base}px;
  line-height: normal;
  margin: 0;
  padding: 0 40px;
  display: flex;
  flex-direction: row;
  align-items: center;
`;

const Illustration = styled.img`
  height: 145px;
  margin-right: 70px;

  ${media.smallerThanMaxTablet`
    display: none;
  `}
`;

const TooltipContent = styled.div`
  display: flex;
  align-items: center;
  padding: 15px;
`;

const TooltipContentIcon = styled(Icon)`
  flex: 0 0 25px;
  width: 20px;
  height: 25px;
  margin-right: 1rem;
`;

const TooltipContentText = styled.div`
  flex: 1 1 auto;
  color: white;
  font-size: ${fontSizes.small}px;
  line-height: ${fontSizes.large}px;
  font-weight: 400;
  overflow-wrap: break-word;
  word-wrap: break-word;
  word-break: break-word;
`;

export interface InputProps {
  className?: string;
}

interface DataProps {
  authUser: GetAuthUserChildProps;
  tenant: GetTenantChildProps;
}

interface Props extends InputProps, DataProps { }

interface State { }

class InitiativesHeader extends PureComponent<Props, State> {
  startInitiative = () => {
    const { authUser } = this.props;

    trackEventByName(tracks.clickStartInitiativesCTA, { extra: { location: 'initiatives header' } });

    if (!isNilOrError(authUser)) {
      clHistory.push('/initiatives/new');
    } else {
      openSignUpInModal({
        action: () => this.startInitiative()
      });
    }
  }

  render() {
    const { className, tenant } = this.props;

    if (isNilOrError(tenant)) return null;

    const postingProposalEnabled = tenant.attributes.settings.initiatives?.posting_enabled;

    return (
      <Container className={`e2e-initiatives-header ${className || ''}`}>
        <Header>
          <ScreenReaderOnly>
            <FormattedMessage tagName="h1" {...messages.invisibleInitiativesPageTitle} />
          </ScreenReaderOnly>
          <HeaderContent>
            <HeaderTitle>
              {postingProposalEnabled ?
                <FormattedMessage
                  {...messages.header}
                  values={{ styledOrgName: <T value={tenant.attributes.settings.core.organization_name} /> }}
                />
                :
                <FormattedMessage
                  {...messages.headerPostingProposalDisabled}
                  values={{ styledOrgName: <T value={tenant.attributes.settings.core.organization_name} /> }}
                />
              }
            </HeaderTitle>
            <StyledAvatarBubbles />
            <div aria-live="polite">
              <Tippy
                disabled={postingProposalEnabled}
                interactive={true}
                placement="bottom"
                content={
                  <TooltipContent id="tooltip-content">
                    <TooltipContentIcon name="lock-outlined" ariaHidden />
                    <TooltipContentText>
                      <FormattedMessage {...messages.postingDisabledExplanation} />
                    </TooltipContentText>
                  </TooltipContent>
                }
                theme="dark"
                hideOnClick={false}
              >
                <div
                  tabIndex={postingProposalEnabled ? -1 : 0}
                >
                  <StartInitiativeButton
                    fontWeight="500"
                    padding="13px 22px"
                    textColor="#FFF"
                    icon="arrowLeft"
                    iconPos="right"
                    iconAriaHidden
                    onClick={this.startInitiative}
                    text={<FormattedMessage {...messages.startInitiative} />}
                    disabled={!postingProposalEnabled}
                  />
                </div>
              </Tippy>
            </div>

          </HeaderContent>
        </Header>
        <InitiativeInfo>
          <Wrapper>
            <Illustration src={illustrationSrc} alt="" />
            <InitiativeInfoContent />
          </Wrapper>
        </InitiativeInfo>
      </Container>
    );
  }
}

const Data = adopt<DataProps, InputProps>({
  authUser: <GetAuthUser />,
  tenant: <GetTenant />
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {dataProps => <InitiativesHeader {...inputProps} {...dataProps} />}
  </Data>
);

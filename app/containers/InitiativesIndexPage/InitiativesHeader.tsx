import React, { PureComponent } from 'react';
import { adopt } from 'react-adopt';
import { isNilOrError } from 'utils/helperUtils';

// components
import AvatarBubbles from 'components/AvatarBubbles';
import InitiativeInfoContent from './InitiativeInfoContent';

// resources
import GetAuthUser, { GetAuthUserChildProps } from 'resources/GetAuthUser';
import GetTenant, { GetTenantChildProps } from 'resources/GetTenant';

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
import InitiativeButton from 'components/InitiativeButton';
import GetInitiativesPermissions, {
  GetInitiativesPermissionsChildProps,
} from 'resources/GetInitiativesPermissions';

const Container = styled.div`
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
  font-size: ${({ theme }) =>
    theme.signedOutHeaderTitleFontSize || fontSizes.xxxxl}px;
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
`;

const Wrapper = styled.div`
  width: auto;
  max-width: 1150px;
  font-size: ${fontSizes.base}px;
  line-height: normal;
  margin: 0;
  padding: 0 40px;
  display: flex;
  align-items: center;
`;

const Illustration = styled.img`
  height: 145px;
  margin-right: 70px;

  ${media.smallerThanMaxTablet`
    display: none;
  `}
`;

export interface InputProps {
  className?: string;
}

interface DataProps {
  authUser: GetAuthUserChildProps;
  tenant: GetTenantChildProps;
  postingPermission: GetInitiativesPermissionsChildProps;
}

interface Props extends InputProps, DataProps {}

interface State {}

class InitiativesHeader extends PureComponent<Props, State> {
  render() {
    const { className, tenant, postingPermission } = this.props;

    if (isNilOrError(tenant)) return null;

    return (
      <Container className={`e2e-initiatives-header ${className || ''}`}>
        <Header>
          <ScreenReaderOnly>
            <FormattedMessage
              tagName="h1"
              {...messages.invisibleInitiativesPageTitle}
            />
          </ScreenReaderOnly>
          <HeaderContent>
            <HeaderTitle>
              {postingPermission?.enabled ? (
                <FormattedMessage
                  {...messages.header}
                  values={{
                    styledOrgName: (
                      <T
                        value={
                          tenant.attributes.settings.core.organization_name
                        }
                      />
                    ),
                  }}
                />
              ) : (
                <FormattedMessage
                  {...messages.headerPostingProposalDisabled}
                  values={{
                    styledOrgName: (
                      <T
                        value={
                          tenant.attributes.settings.core.organization_name
                        }
                      />
                    ),
                  }}
                />
              )}
            </HeaderTitle>
            <StyledAvatarBubbles />
            <InitiativeButton location="initiatives_header" />
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
  tenant: <GetTenant />,
  postingPermission: <GetInitiativesPermissions action="posting_initiative" />,
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {(dataProps) => <InitiativesHeader {...inputProps} {...dataProps} />}
  </Data>
);

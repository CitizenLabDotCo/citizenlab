import React from 'react';

// libraries
import { adopt } from 'react-adopt';
import { withRouter, WithRouterProps } from 'react-router';
import clHistory from 'utils/cl-router/history';
import { Formik } from 'formik';

// components
import GoBackButton from 'components/UI/GoBackButton';
import TipsBox from './TipsBox';
import ContentContainer from 'components/ContentContainer';
import InitiativeForm, { FormValues } from 'components/InitiativeForm';

// services
import { CLErrorsJSON } from 'typings';
import { addInitiative, InitiativePublicationStatus, updateInitiative } from 'services/initiatives';

// resources
import GetAuthUser, { GetAuthUserChildProps } from 'resources/GetAuthUser';
import GetLocale, { GetLocaleChildProps } from 'resources/GetLocale';

// utils
// import { convertToGeoJson, reverseGeocode } from 'utils/locationTools';
import { isNilOrError } from 'utils/helperUtils';

// style
import { media, colors, fontSizes } from 'utils/styleUtils';
import styled from 'styled-components';
import { lighten } from 'polished';

// intl
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';
import { convertToGeoJson } from 'utils/locationTools';
import { isEqual, pick, get } from 'lodash-es';
import InitiativesFormWrapper from './InitiativesFormWrapper';

const Container = styled.div`
  background: ${colors.background};
  min-height: calc(100vh - ${props => props.theme.menuHeight}px - 1px);
  width: 100%;
  position: relative;
`;

const TopLine = styled.div`
  width: 100%;
  position: fixed; /* IE11 fallback */
  position: sticky;
  top: ${({ theme }) => theme.menuHeight}px;
  padding: 30px 40px 0;
`;

const Header = styled.div`
  width: 100%;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-top: 40px;
  padding-bottom: 90px;
  padding-left: 30px;
  padding-right: 30px;

  ${media.smallerThanMaxTablet`
    padding-top: 50px;
    padding-bottom: 50px;
  `}
`;

const HeaderTitle: any = styled.h1`
  width: 100%;
  max-width: 600px;
  color: ${({ theme }) => theme.colorMain};
  font-size: ${({ theme }) => theme.signedOutHeaderTitleFontSize || (fontSizes.xxxl + 1)}px;
  line-height: normal;
  font-weight: ${({ theme }) => theme.signedOutHeaderTitleFontWeight || 600};
  text-align: center;
  margin: 0;
  padding: 0;

  ${media.smallerThanMaxTablet`
    font-size: ${fontSizes.xxl}px;
  `}
`;

const ColoredText = styled.span`
  color: ${({ theme }) => lighten(.3, theme.colorMain)};
`;

const TwoColumns = styled.div`
  display: flex;
  flex-direction: row;
  margin: 30px 0;
`;

const TipsContainer = styled.div`
  position: relative;
  margin-left: 25px;
`;

const StyledTipsBox = styled(TipsBox)`
  position: sticky;
  top: calc(${({ theme }) => theme.menuHeight}px + 50px);
  max-width: 550px;
  width: 100%;
  padding: 40px 50px;
  ${media.smallerThanMaxTablet`
    padding: 30px 35px;
    top: 50px;
    min-width: 250px;
  `}
  ${media.smallerThanMinTablet`
    display: none;
  `}
`;

const StyledInitiativeForm = styled(InitiativeForm)`
  width: 100%;
  min-width: 530px;
  height: 900px;
  ${media.smallerThanMaxTablet`
    min-width: 230px;
  `}
`;

interface InputProps {}

interface DataProps {
  authUser: GetAuthUserChildProps;
  locale: GetLocaleChildProps;
}

interface Props extends InputProps, DataProps {}

interface State {
  initialValues: FormValues | null;
}

class InitiativesNewPage extends React.PureComponent<Props & WithRouterProps, State> {
  constructor(props) {
    super(props);
  }

  goBack = () => {
    clHistory.goBack();
  }

  renderFn = (props) => {
    return <StyledInitiativeForm {...props} />;
  }

  render() {
    const { authUser, locale } = this.props;
    if (isNilOrError(authUser) || isNilOrError(locale)) return null;

    return (
      <Container className="e2e-initiatives-form-page">
        <TopLine>
          <GoBackButton onClick={this.goBack} />
        </TopLine>
        <Header>
          <HeaderTitle>
            <FormattedMessage
              {...messages.header}
              values={{ styledOrgName: <ColoredText><FormattedMessage {...messages.orgName} /></ColoredText> }}
            />
          </HeaderTitle>
        </Header>
        <ContentContainer mode="page">
          <TwoColumns>
            <InitiativesFormWrapper
              userId={authUser.id}
              locale={locale}
            />
            <TipsContainer>
              <StyledTipsBox />
            </TipsContainer>
          </TwoColumns>
        </ContentContainer>
      </Container>
    );
  }
}

const Data = adopt<DataProps, InputProps & WithRouterProps>({
  authUser: <GetAuthUser />,
  locale: <GetLocale />
});

export default (inputProps: InputProps & WithRouterProps) => (
  <Data {...inputProps}>
    {dataProps => <InitiativesNewPage {...inputProps} {...dataProps} />}
  </Data>
);

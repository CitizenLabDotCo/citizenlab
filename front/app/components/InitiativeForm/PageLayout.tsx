import React from 'react';

// libraries
import clHistory from 'utils/cl-router/history';

// components
import GoBackButton from 'components/UI/GoBackButton';
import TipsBox from './TipsBox';
import ContentContainer from 'components/ContentContainer';
import CollapsibleTipsAndInfo from './CollapsibleTipsAndInfo';
import Fragment from 'components/Fragment';

// style
import { media, colors, fontSizes } from 'utils/styleUtils';
import styled from 'styled-components';

// intl
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

const Container = styled.main`
  background: ${colors.background};
  min-height: calc(
    100vh - ${(props) => props.theme.menuHeight + props.theme.footerHeight}px
  );
  width: 100%;
  position: relative;
`;

const TopLine = styled.div`
  width: 100%;
  padding: 30px 40px 0;

  ${media.smallerThanMinTablet`
    display: none;
  `}
`;

const Header = styled.div`
  width: 100%;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-top: 30px;
  padding-bottom: 60px;
  padding-left: 30px;
  padding-right: 30px;

  ${media.smallerThanMaxTablet`
    padding-top: 50px;
    padding-bottom: 40px;
  `}
`;

const HeaderTitle: any = styled.h1`
  width: 100%;
  max-width: 600px;
  color: ${({ theme }) => theme.colorMain};
  font-size: ${({ theme }) =>
    theme.signedOutHeaderTitleFontSize || fontSizes.xxxl + 1}px;
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
  color: ${({ theme }) => theme.colorSecondary};
`;

const TwoColumns = styled.div`
  display: flex;
  flex-direction: row;
  margin: 30px 0 0;

  ${media.smallerThanMaxTablet`
    display: flex;
    flex-direction: column;
    align-items: center;
  `}
`;

const StyledCollapsibleTipsAndInfo = styled(CollapsibleTipsAndInfo)`
  max-width: 620px;
  margin-bottom: 20px;

  ${media.biggerThanMaxTablet`
    display: none;
  `}
`;

const StyledContentContainer = styled(ContentContainer)`
  ${media.smallerThanMinTablet`
    padding-left: 0;
    padding-right: 0;
  `}
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
  margin-bottom: 110px;

  ${media.smallerThanMaxTablet`
    display: none;
  `}
`;

interface Props {
  children: JSX.Element | null;
  className?: string;
  isAdmin: boolean;
}

export default class PageLayout extends React.PureComponent<Props> {
  goBack = () => {
    clHistory.goBack();
  };

  render() {
    const { children, className, isAdmin } = this.props;

    const pageContent = (
      <TwoColumns>
        <div>
          <StyledCollapsibleTipsAndInfo />
          {children}
        </div>
        <TipsContainer>
          <StyledTipsBox />
        </TipsContainer>
      </TwoColumns>
    );
    return (
      <Container className={className}>
        <TopLine>
          <GoBackButton onClick={this.goBack} />
        </TopLine>
        <Header>
          <HeaderTitle>
            <FormattedMessage
              {...messages.header}
              values={{
                styledOrgName: (
                  <ColoredText>
                    <FormattedMessage {...messages.orgName} />
                  </ColoredText>
                ),
              }}
            />
          </HeaderTitle>
        </Header>
        <StyledContentContainer mode="page">
          {isAdmin ? (
            pageContent
          ) : (
            <Fragment name="external-proposal-form">{pageContent}</Fragment>
          )}
        </StyledContentContainer>
      </Container>
    );
  }
}

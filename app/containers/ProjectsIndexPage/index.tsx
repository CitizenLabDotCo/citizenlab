import * as React from 'react';

// components
import ContentContainer from 'components/ContentContainer';
import ProjectCards from 'components/ProjectCards';
import Footer from 'components/Footer';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// style
import styled from 'styled-components';
import { media } from 'utils/styleUtils';

const Container = styled.div`
  min-height: calc(100vh - ${props => props.theme.menuHeight}px - 1px);
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  background: #f9f9fa;

  ${media.smallerThanMaxTablet`
    min-height: calc(100vh - ${props => props.theme.mobileMenuHeight}px - 66px);
  `}
`;

const StyledContentContainer = styled(ContentContainer)`
  flex: 1;
  padding-bottom: 100px;
`;

const PageTitle = styled.h1`
  color: #333;
  font-size: 34px;
  line-height: 40px;
  font-weight: 500;
  text-align: center;
  margin: 0;
  padding: 0;
  padding-top: 60px;
  padding-bottom: 40px;

  ${media.smallerThanMaxTablet`
    font-size: 28px;
    line-height: 34px;
  `}
`;

type Props = {};

type State = {};

export default class IdeasIndex extends React.PureComponent<Props, State> {
  render() {
    return (
      <Container>
        <StyledContentContainer>
          <PageTitle>
            <FormattedMessage {...messages.pageTitle} />
          </PageTitle>
          <ProjectCards queryParameters={{ 'page[size]': 50 }} />
        </StyledContentContainer>
        <Footer />
      </Container>
    );
  }
}

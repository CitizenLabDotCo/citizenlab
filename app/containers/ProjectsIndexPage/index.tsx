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
  display: flex;
  flex-direction: column;
  align-items: center;
  background: #fff;
  position: relative;

  ${media.smallerThanMaxTablet`
    background: #f9f9fa;
  `}
`;

const BackgroundColor = styled.div`
  position: absolute;
  top: 200px;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 0;
  background: #f9f9fa;

  ${media.smallerThanMaxTablet`
    display: none;
  `}
`;

const StyledContentContainer = styled(ContentContainer)`
  padding-bottom: 100px;
`;

const PageTitle = styled.h1`
  height: 60px;
  color: #333;
  font-size: 28px;
  line-height: 32px;
  font-weight: 500;
  margin: 0;
  padding: 0;
  display: none;

  ${media.smallerThanMaxTablet`
    display: flex;
    align-items: flex-end;
  `}
`;

type Props = {};

type State = {};

export default class IdeasIndex extends React.PureComponent<Props, State> {
  render() {
    return (
      <Container>
        <BackgroundColor />
        <StyledContentContainer>
          <PageTitle><FormattedMessage {...messages.pageTitle} /></PageTitle>
          <ProjectCards pageSize={10} />
        </StyledContentContainer>
        <Footer />
      </Container>
    );
  }
}

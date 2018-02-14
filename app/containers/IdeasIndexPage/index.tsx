import * as React from 'react';

// components
import ContentContainer from 'components/ContentContainer';
import IdeaCards from 'components/IdeaCards';
import Footer from 'components/Footer';

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
  padding-bottom: 80px;
`;

type Props = {};

type State = {};

export default class IdeasIndex extends React.PureComponent<Props, State> {
  render() {
    return (
      <Container>
        <BackgroundColor />
        <StyledContentContainer>
          <IdeaCards />
        </StyledContentContainer>
        <Footer />
      </Container>
    );
  }
}

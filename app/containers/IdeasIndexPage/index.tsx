import * as React from 'react';

// components
import ContentContainer from 'components/ContentContainer';
import IdeaCards from 'components/IdeaCards';
import Footer from 'components/Footer';

// style
import styled from 'styled-components';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  background: #fff;
  position: relative;
  background: #f9f9fa;
`;

const StyledContentContainer = styled(ContentContainer)`
  margin-top: 60px;
  padding-bottom: 80px;
`;

type Props = {};

type State = {};

export default class IdeasIndex extends React.PureComponent<Props, State> {
  render() {
    return (
      <Container>
        <StyledContentContainer>
          <IdeaCards />
        </StyledContentContainer>
        <Footer />
      </Container>
    );
  }
}

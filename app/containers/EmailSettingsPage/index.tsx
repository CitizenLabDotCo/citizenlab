// Libraries
import React, { PureComponent } from 'react';

// Components
// import ConsentForm from 'components/ConsentForm';

// Styles
import styled from 'styled-components';
import { colors } from 'utils/styleUtils';

const Container = styled.main`
  width: 100%;
  background-color: ${colors.background};
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 30px;
  padding-bottom: 50px;
  overflow-x: hidden;
`;

interface Props {}

interface State {}

export default class ProfileEditor extends PureComponent<Props, State> {

  constructor(props: Props) {
    super(props);
    this.state = {
    };
  }

  render() {
    return (
      <Container id="e2e-user-edit-profile-page">
        {/* <ConsentForm consents={} /> */}
      </Container>
    );
  }
}

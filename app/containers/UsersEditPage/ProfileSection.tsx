import React from 'react';
import styled from 'styled-components';
import ContentContainer from 'components/ContentContainer';
import { color } from 'utils/styleUtils';
import { Grid, Segment } from 'semantic-ui-react';

const StyledContentContainer = styled(ContentContainer)`
  background: ${color('background')};
  padding-top: 25px;
  padding-bottom: 40px;
`;

export default ({ children }) => (
  <StyledContentContainer>
    <Grid centered>
      <Grid.Row>
        <Grid.Column computer={12} mobile={16}>
          <Segment padded="very">
            {children}
          </Segment>
        </Grid.Column>
      </Grid.Row>
    </Grid>
  </StyledContentContainer>
);

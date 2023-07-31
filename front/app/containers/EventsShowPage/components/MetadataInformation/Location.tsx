import React from 'react';

// components
import { Text } from '@citizenlab/cl2-component-library';

// styling
import { Container, Content, StyledIcon } from './MetadataInformationStyles';

export interface Props {
  location?: string | null;
}

const Location = ({ location }: Props) => {
  if (location) {
    return (
      <Container>
        <StyledIcon name="position" ariaHidden />
        <Content>
          <Text color="coolGrey600" fontSize="s">
            {location}
          </Text>
        </Content>
      </Container>
    );
  }

  return null;
};

export default Location;

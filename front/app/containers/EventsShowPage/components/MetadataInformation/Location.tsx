import React from 'react';

// components
import { Text } from '@citizenlab/cl2-component-library';

// styling
import { Container, Content, StyledIcon } from './MetadataInformationStyles';

// typings
import { Multiloc } from 'typings';
import useLocale from 'hooks/useLocale';

// utils
import { isNilOrError } from 'utils/helperUtils';

export interface Props {
  location: Multiloc;
}

const Location = ({ location }: Props) => {
  const currentLocale = useLocale();
  if (location && !isNilOrError(currentLocale)) {
    return (
      <Container>
        <StyledIcon name="position" ariaHidden />
        <Content>
          <Text color="coolGrey600" fontSize="s">
            {location[currentLocale]}
          </Text>
        </Content>
      </Container>
    );
  }

  return null;
};

export default Location;

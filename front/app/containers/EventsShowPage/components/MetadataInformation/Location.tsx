import React from 'react';

// components
import { Text } from '@citizenlab/cl2-component-library';

// styling
import { Container, Content, StyledIcon } from './MetadataInformationStyles';

// typings
import { Multiloc } from 'typings';

// utils
import { isNilOrError } from 'utils/helperUtils';

// api
import useLocalize from 'hooks/useLocalize';
import useLocale from 'hooks/useLocale';

export interface Props {
  location: Multiloc;
}

const Location = ({ location }: Props) => {
  const currentLocale = useLocale();
  const localize = useLocalize();

  if (location && !isNilOrError(currentLocale)) {
    return (
      <Container>
        <StyledIcon name="position" ariaHidden />
        <Content>
          <Text color="coolGrey600" fontSize="s">
            {localize(location)}
          </Text>
        </Content>
      </Container>
    );
  }

  return null;
};

export default Location;

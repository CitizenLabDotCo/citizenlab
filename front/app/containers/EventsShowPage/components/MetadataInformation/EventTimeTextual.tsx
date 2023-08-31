import React from 'react';

// components
import { Text } from '@citizenlab/cl2-component-library';

// styling
import { Container, Content, StyledIcon } from './MetadataInformationStyles';

// typings
import useLocale from 'hooks/useLocale';
import { IEventData } from 'api/events/types';

// utils
import { isNilOrError } from 'utils/helperUtils';
import { getEventDateString } from 'utils/dateUtils';

export interface Props {
  event: IEventData;
}

const FullEventTime = ({ event }: Props) => {
  const currentLocale = useLocale();
  const eventDateString = getEventDateString(event);

  if (location && !isNilOrError(currentLocale)) {
    return (
      <Container>
        <StyledIcon name="calendar" ariaHidden />
        <Content>
          <Text my="4px" color="coolGrey600" fontSize="s">
            {eventDateString}
          </Text>
        </Content>
      </Container>
    );
  }

  return null;
};

export default FullEventTime;

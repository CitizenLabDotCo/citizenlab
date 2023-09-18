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
import { capitalizeDates, getEventDateWithWeekdays } from 'utils/dateUtils';
import { useIntl } from 'utils/cl-intl';

export interface Props {
  event: IEventData;
}

const FullEventTime = ({ event }: Props) => {
  const currentLocale = useLocale();
  const { formatMessage } = useIntl();
  const eventDateTime = getEventDateWithWeekdays(event, formatMessage);

  if (location && !isNilOrError(currentLocale)) {
    return (
      <Container>
        <StyledIcon name="calendar" ariaHidden />
        <Content>
          <Text my="4px" color="coolGrey600" fontSize="s">
            {capitalizeDates(currentLocale)
              ? eventDateTime
              : eventDateTime.toLowerCase()}
          </Text>
        </Content>
      </Container>
    );
  }

  return null;
};

export default FullEventTime;

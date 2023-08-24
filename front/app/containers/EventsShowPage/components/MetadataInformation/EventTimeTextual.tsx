import React from 'react';

// components
import { Box, Button, Error, Text } from '@citizenlab/cl2-component-library';

// styling
import { Container, Content, StyledIcon } from './MetadataInformationStyles';

// api
import { fetchEventICS } from 'api/events/useEventICS';

// typings
import useLocale from 'hooks/useLocale';
import { IEventData } from 'api/events/types';

// utils
import { isNilOrError } from 'utils/helperUtils';
import { capitalizeDates, getEventDateWithWeekdays } from 'utils/dateUtils';

// intl
import { useIntl } from 'utils/cl-intl';
import messages from '../../messages';
export interface Props {
  event: IEventData;
}

const FullEventTime = ({ event }: Props) => {
  const currentLocale = useLocale();
  const { formatMessage } = useIntl();
  const eventDateTime = getEventDateWithWeekdays(event, formatMessage);
  let isError = false;

  const handleICSDownload = async () => {
    try {
      const icsBlob = await fetchEventICS(event.id);
      const icsFileData = new Blob([icsBlob.toString()], {
        type: 'text/calendar;charset=utf-8',
      });
      // Open/Save link
      window.open(encodeURI(`data:text/calendar;charset=utf8,${icsFileData}`));
      isError = false;
    } catch (e) {
      isError = true;
    }
  };

  if (location && !isNilOrError(currentLocale)) {
    return (
      <>
        <Container>
          <StyledIcon name="calendar" ariaHidden />
          <Content>
            <Text my="4px" color="coolGrey600" fontSize="s">
              {capitalizeDates(currentLocale)
                ? eventDateTime
                : eventDateTime.toLowerCase()}
            </Text>
            <Box display="flex">
              <Button
                m="0px"
                p="0px"
                buttonStyle="text"
                onClick={handleICSDownload}
                pl="0px"
                color="tenantPrimary"
                style={{
                  textDecoration: 'underline',
                  justifyContent: 'left',
                  textAlign: 'left',
                }}
                id="e2e-location-with-coordinates-button"
              >
                <Text
                  mt="4px"
                  color="tenantPrimary"
                  m="0px"
                  p="0px"
                  fontSize="s"
                >
                  {formatMessage(messages.addToCalendar)}
                </Text>
              </Button>
            </Box>
            {isError && (
              <Box display="flex">
                <Error text={formatMessage(messages.icsError)} />
              </Box>
            )}
          </Content>
        </Container>
      </>
    );
  }

  return null;
};

export default FullEventTime;

import React from 'react';

// components
import { Box, Text, Button, Error } from '@citizenlab/cl2-component-library';

// api
import { fetchEventICS } from 'api/events/useEventICS';

// intl
import messages from './messages';
import { useIntl } from 'utils/cl-intl';

export const AddEventToCalendarButton = (eventId) => {
  const { formatMessage } = useIntl();
  let isError = false;

  const handleICSDownload = async () => {
    try {
      const icsBlob = await fetchEventICS(eventId);
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

  return (
    <>
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
          <Text mt="4px" color="tenantPrimary" m="0px" p="0px" fontSize="s">
            {formatMessage(messages.addToCalendar)}
          </Text>
        </Button>
      </Box>
      {isError && (
        <Box display="flex">
          <Error text={formatMessage(messages.icsError)} />
        </Box>
      )}
    </>
  );
};

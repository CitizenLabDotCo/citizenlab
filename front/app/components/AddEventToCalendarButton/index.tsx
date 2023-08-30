import React from 'react';

// components
import { Box, Text, Button, Error } from '@citizenlab/cl2-component-library';

// intl
import messages from './messages';
import { useIntl } from 'utils/cl-intl';

// util
import { requestBlob } from 'utils/request';
import { API_PATH } from 'containers/App/constants';
import saveAs from 'file-saver';

export const AddEventToCalendarButton = ({ eventId }: { eventId: string }) => {
  const { formatMessage } = useIntl();
  let isError = false;

  const handleICSDownload = async () => {
    try {
      const blob = await requestBlob(
        `${API_PATH}/events/${eventId}.ics`,
        'text/calendar'
      );
      saveAs(blob, `${eventId}.ics`);
    } catch {
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

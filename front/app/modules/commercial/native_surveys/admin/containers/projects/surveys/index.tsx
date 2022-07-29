import React from 'react';
import { InjectedIntlProps } from 'react-intl';
import { injectIntl } from 'utils/cl-intl';

// components
import { Toggle, Box, Title, Text } from '@citizenlab/cl2-component-library';
import Button from 'components/UI/Button';

// i18n
import messages from './messages';

const Surveys = ({ intl: { formatMessage } }: InjectedIntlProps) => (
  <Box width="100%">
    <Box display="flex" flexDirection="row" width="100%" mb="48px">
      <Box width="100%">
        <Title>{formatMessage(messages.survey)}</Title>
        <Text>{formatMessage(messages.surveyDescription)}</Text>
      </Box>
      <Box
        width="100%"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Toggle
          checked
          label={formatMessage(messages.openForSubmissions)}
          onChange={() => {
            // TODO: Handle open for submissions
          }}
        />
      </Box>
    </Box>
    <Box
      display="flex"
      flexDirection="row"
      width="100%"
      justifyContent="space-between"
    >
      <Button
        icon="download"
        buttonStyle="primary"
        width="auto"
        minWidth="312px"
      >
        {formatMessage(messages.downloadSurveyResults, {
          count: 956, // TODO: Get this from the API
        })}
      </Button>
      <Button icon="edit" buttonStyle="primary" width="auto" minWidth="312px">
        {formatMessage(messages.editSurveyContent)}
      </Button>
      <Button icon="eye" buttonStyle="primary" width="auto" minWidth="312px">
        {formatMessage(messages.viewSurvey)}
      </Button>
    </Box>
  </Box>
);

export default injectIntl(Surveys);

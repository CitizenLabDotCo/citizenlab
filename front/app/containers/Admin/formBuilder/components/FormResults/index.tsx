import React from 'react';
import { InjectedIntlProps } from 'react-intl';
import { injectIntl } from 'utils/cl-intl';

// components
import {
  Box,
  Title,
  Text,
  Icon,
  colors,
} from '@citizenlab/cl2-component-library';
import Button from 'components/UI/Button';

// i18n
import messages from '../messages';

const FormResults = ({ intl: { formatMessage } }: InjectedIntlProps) => {
  return (
    <Box width="100%">
      <Box width="100%" display="flex" alignItems="center">
        <Box width="100%">
          <Title>{formatMessage(messages.surveyResults)}</Title>
          <Text>
            {formatMessage(messages.totalSurveyResponses, {
              count: 956,
            })}
          </Text>
        </Box>
        <Box>
          <Button
            icon="download"
            buttonStyle="secondary"
            width="auto"
            minWidth="312px"
          >
            {formatMessage(messages.downloadSurveyResults)}
          </Button>
        </Box>
      </Box>

      <Box
        bgColor={colors.clGreenSuccessBackground}
        borderRadius="3px"
        px="12px"
        py="4px"
        mb="12px"
        role="alert"
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        data-testid="feedbackSuccessMessage"
      >
        <Box display="flex" gap="16px" alignItems="center">
          <Icon name="info" width="24px" height="24px" />
          <Title color="clGreenSuccess" variant="h4" as="h3">
            {formatMessage(messages.informationText)}
          </Title>
        </Box>
      </Box>
    </Box>
  );
};

export default injectIntl(FormResults);

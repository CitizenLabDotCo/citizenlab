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
import CompletionBar from 'containers/Admin/formBuilder/components/FormResults/CompletionBar';
import T from 'components/T';

// i18n
import messages from '../messages';

// styles
import styled from 'styled-components';

// utils
import { media } from 'utils/styleUtils';

// Dummy data
import { surveyResults } from './dummySurveyResults';

const StyledBox = styled(Box)`
  display: grid;
  gap: 80px;

  ${media.smallerThanMaxTablet`
    grid-template-columns: 1fr;
  `}

  grid-template-columns: 1fr 1fr;
`;

const FormResults = ({ intl: { formatMessage } }: InjectedIntlProps) => {
  const {
    data: { totalSubmissions, results },
  } = surveyResults;

  return (
    <Box width="100%">
      <Box width="100%" display="flex" alignItems="center">
        <Box width="100%">
          <Title>{formatMessage(messages.surveyResults)}</Title>
          <Text>
            {formatMessage(messages.totalSurveyResponses, {
              count: totalSubmissions,
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
            {formatMessage(messages.downloadSurveyResults, {
              count: totalSubmissions,
            })}
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
      <StyledBox mt="12px">
        {results.map((result, index) => {
          const { question, answers, totalResponses } = result;
          return (
            <Box key={index}>
              <Text>
                <T value={question} />
              </Text>
              {answers.map(({ answer, responses }, index) => {
                const percentage =
                  Math.round((responses / totalResponses) * 1000) / 10;

                return (
                  <CompletionBar
                    key={index}
                    bgColor={colors.adminTextColor}
                    completed={percentage}
                    leftLabel={answer}
                    rightLabel={`${percentage}% (${responses}) choices`}
                  />
                );
              })}
            </Box>
          );
        })}
      </StyledBox>
    </Box>
  );
};

export default injectIntl(FormResults);

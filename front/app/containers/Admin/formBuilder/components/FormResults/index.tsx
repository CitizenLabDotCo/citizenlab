import React from 'react';
import { InjectedIntlProps } from 'react-intl';
import { injectIntl } from 'utils/cl-intl';
import { get } from 'lodash-es';
import { useParams } from 'react-router-dom';

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
import { isNilOrError } from 'utils/helperUtils';

// hooks
import useFormResults from 'hooks/useFormResults';

const StyledBox = styled(Box)`
  display: grid;
  gap: 80px;

  ${media.smallerThanMaxTablet`
    grid-template-columns: 1fr;
  `}

  grid-template-columns: 1fr 1fr;
`;

const FormResults = ({ intl: { formatMessage } }: InjectedIntlProps) => {
  const { projectId } = useParams() as {
    projectId: string;
  };

  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  let phaseId = urlParams.get('phase_id');
  if (phaseId === null) {
    phaseId = '';
  }

  const formResults = useFormResults({
    projectId,
    phaseId,
  });

  if (isNilOrError(formResults)) {
    return null;
  }

  const { totalSubmissions, results } = formResults;

  return (
    <Box width="100%">
      <Box width="100%" display="flex" alignItems="center">
        <Box width="100%">
          <Title variant="h2">{formatMessage(messages.surveyResults)}</Title>
          {totalSubmissions && (
            <Text variant="bodyM" color="teal700">
              {formatMessage(messages.totalSurveyResponses, {
                count: totalSubmissions,
              })}
            </Text>
          )}
        </Box>
        <Box>
          <Button
            icon="download"
            buttonStyle="secondary"
            width="auto"
            minWidth="312px"
          >
            {formatMessage(messages.downloadResults)}
          </Button>
        </Box>
      </Box>

      <Box
        bgColor={colors.teal100}
        borderRadius="3px"
        px="12px"
        py="4px"
        mb="12px"
        role="alert"
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mt="32px"
      >
        <Box display="flex" gap="16px" alignItems="center">
          <Icon name="info" width="24px" height="24px" fill="teal700" />
          <Text variant="bodyM" color="teal700">
            {formatMessage(messages.informationText)}
          </Text>
        </Box>
      </Box>
      <StyledBox mt="12px">
        {results.map(
          ({ question, inputType, answers, totalResponses }, index) => {
            const inputTypeText = get(messages, inputType, '');
            return (
              <Box key={index}>
                <Text fontWeight="bold">
                  <T value={question} />
                </Text>
                {inputTypeText && (
                  <Text variant="bodyS" color="textSecondary">
                    {formatMessage(inputTypeText)}
                  </Text>
                )}
                {answers.map(({ answer, responses }, index) => {
                  const percentage =
                    Math.round((responses / totalResponses) * 1000) / 10;

                  return (
                    <CompletionBar
                      key={index}
                      bgColor={colors.primary}
                      completed={percentage}
                      leftLabel={answer}
                      rightLabel={`${percentage}% (${responses} choices)`}
                    />
                  );
                })}
              </Box>
            );
          }
        )}
      </StyledBox>
    </Box>
  );
};

export default injectIntl(FormResults);

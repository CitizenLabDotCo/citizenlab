import React from 'react';

import {
  Box,
  colors,
  Text,
  Title,
  Tooltip,
} from '@citizenlab/cl2-component-library';
import { useTheme } from 'styled-components';

import { LogicConfig, ResultUngrouped } from 'api/survey_results/types';

import useLocalize from 'hooks/useLocalize';

import { useIntl } from 'utils/cl-intl';

import LogicIcon from '../LogicIcon';
import messages from '../messages';

type FormResultsPageProps = {
  result: ResultUngrouped;
  totalSubmissions: number;
  logicConfig: LogicConfig;
};

const FormResultsPage = ({
  result,
  totalSubmissions,
  logicConfig,
}: FormResultsPageProps) => {
  const localize = useLocalize();
  const { formatMessage } = useIntl();
  const theme = useTheme();

  const {
    question,
    pageNumber,
    totalResponseCount,
    questionResponseCount,
    hidden,
    customFieldId,
    logic,
  } = result;

  const questionTitle = localize(question);
  const pageTitle = `${formatMessage(messages.page)} ${pageNumber}${
    questionTitle ? `: ${questionTitle}` : ''
  }`;

  if (hidden) {
    return (
      <Box borderLeft={`4px solid ${colors.coolGrey300}`} pl="12px">
        <Text color={'grey500'}>
          {pageTitle} {formatMessage(messages.hiddenByLogic)}
        </Text>
      </Box>
    );
  }

  return (
    <Box
      data-cy={`e2e-survey-result-page-${pageNumber}`}
      mb="24px"
      pl="12px"
      borderLeft={`4px solid ${theme.colors.tenantPrimary}`}
    >
      <Title variant="h3" mt="12px" mb="12px">
        {pageTitle}
      </Title>

      <Box display="flex" width="40%">
        <Tooltip
          disabled={totalResponseCount === totalSubmissions}
          placement="bottom-start"
          content={formatMessage(messages.resultsCountQuestionTooltip)}
          theme="dark"
        >
          <Text variant="bodyS" color="textSecondary" mt="0" mb="4px">
            {`${questionResponseCount}/${totalResponseCount} ${formatMessage(
              messages.responses
            ).toLowerCase()}`}
          </Text>
        </Tooltip>
        <LogicIcon
          logicFilterId={logic?.nextPageNumber ? customFieldId : null}
          logicConfig={logicConfig}
          fieldLogic={logic}
          type="page"
        />
      </Box>
    </Box>
  );
};

export default FormResultsPage;

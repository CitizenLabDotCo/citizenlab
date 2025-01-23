import React from 'react';

import { Box, colors, Text, Title } from '@citizenlab/cl2-component-library';
import { snakeCase } from 'lodash-es';
import { useTheme } from 'styled-components';

import { LogicConfig, ResultUngrouped } from 'api/survey_results/types';

import useLocalize from 'hooks/useLocalize';

import LogicIcon from 'containers/Admin/projects/project/nativeSurvey/FormResults/LogicIcon';

import T from 'components/T';

import { useIntl } from 'utils/cl-intl';

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

  const { question, pageNumber, questionResponseCount, customFieldId, logic } =
    result;

  const pageTitle = <T value={question} />;

  if (result.hidden) {
    return (
      <Box borderLeft={`4px solid ${colors.coolGrey300}`} pl="12px">
        <Text color={'grey500'}>
          {formatMessage(messages.page)} {pageNumber}
          {pageTitle && <>: {pageTitle}</>}
          {formatMessage(messages.hiddenByLogic)}
        </Text>
      </Box>
    );
  }

  return (
    <Box
      data-cy={`e2e-${snakeCase(localize(question))}`}
      mb="24px"
      borderLeft={`4px solid ${theme.colors.tenantPrimary}`}
      pl="12px"
    >
      <Title variant="h3" mt="12px" mb="12px">
        {formatMessage(messages.page)} {pageNumber}
        {pageTitle && <>: {pageTitle}</>}
      </Title>
      <Box display="flex">
        <Text variant="bodyS" color="textSecondary" mt="0" mb="4px">
          {`${questionResponseCount}/${totalSubmissions} ${formatMessage(
            messages.responses
          ).toLowerCase()}`}
        </Text>
        <LogicIcon
          logicFilterId={logic.nextPageNumber ? customFieldId : null}
          logicConfig={logicConfig}
          fieldLogic={logic}
          type="page"
        />
      </Box>
    </Box>
  );
};

export default FormResultsPage;

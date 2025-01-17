import React from 'react';

import {
  Box,
  colors,
  Icon,
  Text,
  Title,
} from '@citizenlab/cl2-component-library';
import { snakeCase } from 'lodash-es';

import { ResultUngrouped } from 'api/survey_results/types';

import useLocalize from 'hooks/useLocalize';

import T from 'components/T';
import { useTheme } from 'styled-components';

import messages from '../messages';
import { useIntl } from 'utils/cl-intl';

type FormResultsPageProps = {
  result: ResultUngrouped;
  totalSubmissions: number;
};

const FormResultsPage = ({
  result,
  totalSubmissions,
}: FormResultsPageProps) => {
  const localize = useLocalize();
  const { formatMessage } = useIntl();
  const theme = useTheme();

  const { question, pageNumber, questionResponseCount, logic } = result;

  const pageTitle = <T value={question} />;

  return (
    <Box
      data-cy={`e2e-${snakeCase(localize(question))}`}
      mb="24px"
      borderLeft={`4px solid ${theme.colors.tenantPrimary}`}
      pl="12px"
    >
      <Title variant="h3" mt="12px" mb="12px">
        Page {pageNumber}
        {pageTitle && <>: {pageTitle}</>}
      </Title>
      <Text variant="bodyS" color="textSecondary" mt="12px" mb="12px">
        {`${questionResponseCount}/${totalSubmissions} ${formatMessage(
          messages.responses
        ).toLowerCase()}`}

        {logic && (
          <Icon
            fill={colors.coolGrey500}
            width="18px"
            name="logic"
            my="auto"
            ml="12px"
          />
        )}
      </Text>
    </Box>
  );
};

export default FormResultsPage;

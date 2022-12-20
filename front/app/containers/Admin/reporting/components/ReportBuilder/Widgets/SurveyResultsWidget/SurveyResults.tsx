import React, { useMemo } from 'react';

// components
import { Box, Text } from '@citizenlab/cl2-component-library';
import FormResultsQuestion from 'containers/Admin/formBuilder/components/FormResults/FormResultsQuestion';

// messages
import messages from './messages';

// hooks
import useLocale from 'hooks/useLocale';
import useProject from 'hooks/useProject';
import useFormResults from 'hooks/useFormResults';

// utils
import { isNilOrError } from 'utils/helperUtils';
import { useIntl } from 'utils/cl-intl';
import { createResultRows } from './utils';

type Props = {
  projectId: string;
  phaseId?: string;
  shownQuestions?: boolean[];
};

const SurveyResultsReport = ({ projectId, phaseId, shownQuestions }: Props) => {
  const { formatMessage } = useIntl();
  const locale = useLocale();
  const project = useProject({ projectId });
  const formResults = useFormResults({
    projectId,
    phaseId,
  });

  const resultRows = useMemo(() => {
    if (isNilOrError(formResults)) return null;

    const { results } = formResults;
    return createResultRows(results, shownQuestions);
  }, [formResults, shownQuestions]);

  if (
    isNilOrError(formResults) ||
    isNilOrError(locale) ||
    isNilOrError(project) ||
    formResults.results.length === 0
  ) {
    return (
      <Box px="20px" width="100%" display="flex" flexDirection="row">
        <Text variant="bodyM" color="textSecondary">
          {formatMessage(messages.surveyNoResults)}
        </Text>
      </Box>
    );
  }

  if (resultRows === null) return null;

  const surveyResponseMessage = formatMessage(messages.totalParticipants, {
    numberOfParticipants: formResults.totalSubmissions,
  });

  return (
    <>
      <Box px="20px" width="100%" display="flex" flexDirection="row">
        <Text variant="bodyM" color="textSecondary">
          {surveyResponseMessage}
        </Text>
      </Box>
      {resultRows.map((row, index) => {
        return (
          <Box
            px="20px"
            width="100%"
            display="flex"
            flexDirection="row"
            key={index}
          >
            {row.map((result, index) => {
              return (
                <Box px="20px" width="50%" key={index} border="1px solid #ccc">
                  <FormResultsQuestion locale={locale} {...result} />
                </Box>
              );
            })}
          </Box>
        );
      })}
    </>
  );
};

type OuterProps = {
  projectId?: string;
  phaseId?: string;
  shownQuestions?: boolean[];
};

const SurveyResultsReportWrapper = ({
  projectId,
  ...otherProps
}: OuterProps) => {
  if (projectId === undefined) return null;
  return <SurveyResultsReport projectId={projectId} {...otherProps} />;
};

export default SurveyResultsReportWrapper;

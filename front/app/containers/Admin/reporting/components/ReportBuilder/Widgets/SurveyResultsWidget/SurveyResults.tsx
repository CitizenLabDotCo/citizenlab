import React, { useMemo } from 'react';

// hooks
import useLocale from 'hooks/useLocale';
import useProjectById from 'api/projects/useProjectById';
import usePhase from 'api/phases/usePhase';
import { useSurveyResults } from 'api/graph_data_units';

// components
import { Box, Text } from '@citizenlab/cl2-component-library';
import NoData from '../_shared/NoData';
import FormResultsQuestion from './FormResultsQuestion';
import Dot from './Dot';
import PageBreakBox from 'components/admin/ContentBuilder/Widgets/PageBreakBox';

// i18n
import messages from './messages';
import useLocalize from 'hooks/useLocalize';

// utils
import { isNilOrError } from 'utils/helperUtils';
import { useIntl } from 'utils/cl-intl';
import { createResultRows } from './utils';
import { BORDER } from '../constants';

type Props = {
  phaseId: string;
  shownQuestions?: boolean[];
};

const SurveyResults = ({ phaseId, shownQuestions }: Props) => {
  const { formatMessage } = useIntl();
  const locale = useLocale();
  const localize = useLocalize();
  const { data: phase } = usePhase(phaseId);
  const { data: project } = useProjectById(
    phase?.data.relationships.project.data.id
  );

  const formResults = useSurveyResults({
    phaseId,
  });

  const resultRows = useMemo(() => {
    if (isNilOrError(formResults)) return null;

    const { results } = formResults.data.attributes;
    // Filtering out qualitative questions
    const fitleredResults = results.filter((result) => {
      return (
        result.inputType !== 'text' && result.inputType !== 'multiline_text'
      );
    });
    return createResultRows(fitleredResults, shownQuestions);
  }, [formResults, shownQuestions]);

  if (
    isNilOrError(formResults) ||
    isNilOrError(locale) ||
    !project ||
    formResults.data.attributes.results.length === 0
  ) {
    return <NoData message={messages.surveyNoQuestions} />;
  }

  if (resultRows === null) return null;

  const surveyResponseMessage = formatMessage(messages.totalParticipants, {
    numberOfParticipants: formResults.data.attributes.totalSubmissions,
  });

  return (
    <>
      <Box width="100%" mb="24px">
        <Text variant="bodyM" mt="0px" mb="0px">
          {'| '}
          {localize(project.data.attributes.title_multiloc)}
          {phase && (
            <>
              {' '}
              (
              {formatMessage(messages.phase, {
                phaseName: localize(phase.data.attributes.title_multiloc),
              })}
              )
            </>
          )}
        </Text>
        <Text variant="bodyS" color="textSecondary" mt="8px" mb="0px">
          <Dot />
          {surveyResponseMessage}
        </Text>
      </Box>
      {resultRows.map((row, rowIndex) => (
        <PageBreakBox
          width="100%"
          display="flex"
          flexDirection="row"
          key={rowIndex}
        >
          {row.map((result, index) => (
            <Box
              // px={DEFAULT_PADDING}
              pr={index === 0 ? '10px' : undefined}
              pl={index === 1 ? '10px' : undefined}
              width="50%"
              key={`${rowIndex}-${index}`}
              borderTop={BORDER}
              borderRight={index === 0 ? BORDER : undefined}
            >
              <FormResultsQuestion locale={locale} {...result} />
            </Box>
          ))}
        </PageBreakBox>
      ))}
    </>
  );
};

export default SurveyResults;

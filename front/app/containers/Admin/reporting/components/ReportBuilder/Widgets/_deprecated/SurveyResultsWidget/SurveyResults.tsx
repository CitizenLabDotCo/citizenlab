import React, { useMemo } from 'react';

import { Box, Text } from '@citizenlab/cl2-component-library';

import { useSurveyResults } from 'api/graph_data_units';
import usePhase from 'api/phases/usePhase';
import useProjectById from 'api/projects/useProjectById';

import useLocale from 'hooks/useLocale';
import useLocalize from 'hooks/useLocalize';

import PageBreakBox from 'components/admin/ContentBuilder/Widgets/PageBreakBox';

import { useIntl } from 'utils/cl-intl';
import { isNilOrError } from 'utils/helperUtils';

import NoData from '../../_shared/NoData';
import { BORDER } from '../../constants';

import Dot from './Dot';
import FormResultsQuestion from './FormResultsQuestion';
import messages from './messages';
import { createResultRows } from './utils';

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

  const { data } = useSurveyResults({
    phase_id: phaseId,
  });

  const resultRows = useMemo(() => {
    if (isNilOrError(data)) return null;

    const { results } = data.data.attributes;
    // Filtering out qualitative questions
    const filteredResults = results.filter((result) => {
      return (
        result.inputType !== 'text' && result.inputType !== 'multiline_text'
      );
    });
    return createResultRows(filteredResults, shownQuestions);
  }, [data, shownQuestions]);

  if (
    isNilOrError(data) ||
    isNilOrError(locale) ||
    !project ||
    data.data.attributes.results.length === 0
  ) {
    return <NoData message={messages.surveyNoQuestions} />;
  }

  if (resultRows === null) return null;

  const surveyResponseMessage = formatMessage(messages.totalParticipants, {
    numberOfParticipants: data.data.attributes.totalSubmissions,
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
              <FormResultsQuestion
                locale={locale}
                totalSubmissions={data.data.attributes.totalSubmissions}
                {...result}
              />
            </Box>
          ))}
        </PageBreakBox>
      ))}
    </>
  );
};

export default SurveyResults;

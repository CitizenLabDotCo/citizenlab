import React, { useMemo } from 'react';

// hooks
import useLocale from 'hooks/useLocale';
import useProject from 'hooks/useProject';
import usePhase from 'hooks/usePhase';
import useFormResults from 'hooks/useFormResults';

// components
import { Box, Text } from '@citizenlab/cl2-component-library';
import NoData from '../_shared/NoData';
import FormResultsQuestion from 'containers/Admin/formBuilder/components/FormResults/FormResultsQuestion';
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
  projectId: string;
  phaseId?: string;
  shownQuestions?: boolean[];
};

const SurveyResults = ({ projectId, phaseId, shownQuestions }: Props) => {
  const { formatMessage } = useIntl();
  const locale = useLocale();
  const localize = useLocalize();
  const project = useProject({ projectId });
  const phase = usePhase(phaseId ?? null);
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
    return <NoData message={messages.surveyNoQuestions} />;
  }

  if (resultRows === null) return null;

  const surveyResponseMessage = formatMessage(messages.totalParticipants, {
    numberOfParticipants: formResults.totalSubmissions,
  });

  return (
    <>
      <Box px="20px" width="100%" mb="24px">
        <Text variant="bodyM" color="primary" mt="0px" mb="0px">
          {'| '}
          {localize(project.attributes.title_multiloc)}
          {!isNilOrError(phase) && (
            <>
              {' '}
              (
              {formatMessage(messages.phase, {
                phaseName: localize(phase.attributes.title_multiloc),
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
              px="20px"
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

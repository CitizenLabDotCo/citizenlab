import React, { useContext } from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import { Element } from '@craftjs/core';

import useCommunityMonitorProject from 'api/community_monitor/useCommunityMonitorProject';
import useRawCustomFields from 'api/custom_fields/useRawCustomFields';

import useAppConfigurationLocales from 'hooks/useAppConfigurationLocales';

import Container from 'components/admin/ContentBuilder/Widgets/Container';
import WhiteSpace from 'components/admin/ContentBuilder/Widgets/WhiteSpace';

import { useFormatMessageWithLocale } from 'utils/cl-intl';

import CommunityMonitorHealthScoreWidget from '../../Widgets/CommunityMonitorHealthScoreWidget';
import SurveyQuestionResultWidget from '../../Widgets/SurveyQuestionResultWidget';
import TextMultiloc from '../../Widgets/TextMultiloc';
import { TemplateContext } from '../context';
import messages from '../messages';
import { toMultiloc } from '../utils';

export interface Props {
  year: number;
  quarter: number;
}

const CommunityMonitorTemplateContent = ({ year, quarter }: Props) => {
  const { data: project } = useCommunityMonitorProject({});
  const phaseId = project?.data.relationships.current_phase?.data?.id;
  const appConfigurationLocales = useAppConfigurationLocales();
  const formatMessageWithLocale = useFormatMessageWithLocale();

  const { data: surveyQuestions, isLoading } = useRawCustomFields({
    phaseId,
  });

  if (!project?.data.id || !phaseId || !appConfigurationLocales || isLoading) {
    return null;
  }

  const filteredSurveyQuestions =
    surveyQuestions?.data.filter(
      (field) => field.attributes.input_type === 'sentiment_linear_scale'
    ) ?? [];

  return (
    <Element id="community-monitor-report-template" is={Box} canvas>
      <TextMultiloc
        text={toMultiloc(
          messages.quarterReport,
          appConfigurationLocales,
          formatMessageWithLocale,
          {
            year: year.toString(),
            quarter: quarter.toString(),
          }
        )}
      />
      <WhiteSpace />
      <CommunityMonitorHealthScoreWidget
        year={year.toString()}
        quarter={quarter.toString()}
      />
      <WhiteSpace />
      {filteredSurveyQuestions.map((question) => (
        <Element is={Container} canvas key={question.id}>
          <SurveyQuestionResultWidget
            projectId={project.data.id}
            phaseId={phaseId}
            questionId={question.id}
            year={year}
            quarter={quarter}
          />
          <WhiteSpace />
        </Element>
      ))}
    </Element>
  );
};

const CommunityMonitorTemplate = ({ year, quarter }: Props) => {
  const enabled = useContext(TemplateContext);

  if (enabled) {
    return <CommunityMonitorTemplateContent year={year} quarter={quarter} />;
  }
  return <Element id="community-monitor-report-template" is={Box} canvas />;
};

export default CommunityMonitorTemplate;

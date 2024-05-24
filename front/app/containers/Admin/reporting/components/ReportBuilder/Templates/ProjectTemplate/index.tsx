import React, { useContext } from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import { Element } from '@craftjs/core';
import moment from 'moment';

import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import useRawCustomFields from 'api/custom_fields/useRawCustomFields';
import usePhases from 'api/phases/usePhases';
import useProjectById from 'api/projects/useProjectById';
import useReport from 'api/reports/useReport';
import useUserCustomFields from 'api/user_custom_fields/useUserCustomFields';
import useUserById from 'api/users/useUserById';

import useAppConfigurationLocales from 'hooks/useAppConfigurationLocales';

import { WIDGET_TITLES } from 'containers/Admin/reporting/components/ReportBuilder/Widgets';
import getProjectPeriod from 'containers/Admin/reporting/utils/getProjectPeriod';
import { createMultiloc } from 'containers/Admin/reporting/utils/multiloc';

import Container from 'components/admin/ContentBuilder/Widgets/Container';
import WhiteSpace from 'components/admin/ContentBuilder/Widgets/WhiteSpace';

import { MessageDescriptor, useFormatMessageWithLocale } from 'utils/cl-intl';
import { withoutSpacing, getFullName } from 'utils/textUtils';

import { SURVEY_QUESTION_INPUT_TYPES } from '../../constants';
import aboutMessages from '../../Widgets/_deprecated/AboutReportWidget/messages';
import { getPeriod } from '../../Widgets/_deprecated/AboutReportWidget/utils';
import ActiveUsersWidget from '../../Widgets/ChartWidgets/ActiveUsersWidget';
import DemographicsWidget from '../../Widgets/ChartWidgets/DemographicsWidget';
import { INPUT_TYPES } from '../../Widgets/ChartWidgets/DemographicsWidget/Settings';
import ImageMultilocWidget from '../../Widgets/ImageMultiloc';
import MostReactedIdeasWidget from '../../Widgets/MostReactedIdeasWidget';
import SurveyQuestionResultWidget from '../../Widgets/SurveyQuestionResultWidget';
import TextMultiloc from '../../Widgets/TextMultiloc';
import TwoColumn from '../../Widgets/TwoColumn';
import { TemplateContext } from '../context';

import { getTemplateData } from './getTemplateData';
import messages from './messages';

export interface Props {
  reportId: string;
  projectId: string;
}

const ProjectTemplateContent = ({ reportId, projectId }: Props) => {
  const formatMessageWithLocale = useFormatMessageWithLocale();
  const { data: appConfiguration } = useAppConfiguration();
  const appConfigurationLocales = useAppConfigurationLocales();
  const { data: project } = useProjectById(projectId);
  const { data: phases } = usePhases(projectId);
  const { data: report } = useReport(reportId);
  const { data: user } = useUserById(report?.data.relationships.owner?.data.id);
  const { data: userFields } = useUserCustomFields({ inputTypes: INPUT_TYPES });

  const projectModerator = !user ? null : getFullName(user.data);

  const templateData = phases ? getTemplateData(phases.data) : null;

  const { data: surveyQuestions } = useRawCustomFields({
    phaseId:
      templateData?.participationMethod === 'native_survey'
        ? templateData?.phaseId
        : undefined,
  });

  if (
    !appConfiguration ||
    !project ||
    !phases ||
    !report ||
    !projectModerator ||
    !userFields ||
    !templateData
  ) {
    return null;
  }

  const { participationMethod, phaseId } = templateData;
  if (participationMethod === 'native_survey' && !surveyQuestions) {
    return null;
  }

  const hasPhases = phases.data.length > 0;

  const projectPeriod = hasPhases
    ? getProjectPeriod(phases.data)
    : { startAt: undefined, endAt: moment().format('YYYY-MM-DD') };

  if (!appConfigurationLocales) return null;

  const reportTitle = report.data.attributes.name;
  const projectTitle = project?.data.attributes.title_multiloc;

  const reportTitleMultiloc = reportTitle
    ? createMultiloc(appConfigurationLocales, (_locale) => {
        return `<h2>${reportTitle}</h2>`;
      })
    : null;

  const aboutTextMultiloc = createMultiloc(
    appConfigurationLocales,
    (locale) => {
      const formatMessage = (message, values) =>
        formatMessageWithLocale(locale, message, values);

      const { startAt, endAt } = projectPeriod;
      const period = getPeriod({ startAt, endAt, formatMessage });

      return withoutSpacing`
        <ul>
          <li>${formatMessage(aboutMessages.projectLabel, {
            projectsList: projectTitle?.[locale] ?? '',
          })}</li>
          ${period ? `<li>${period}</li>` : ''}
          <li>${formatMessage(aboutMessages.managerLabel, {
            managerName: projectModerator,
          })}</li>
        </ul>
      `;
    }
  );

  const toMultilocParagraph = (
    title: MessageDescriptor,
    text: MessageDescriptor
  ) => {
    return createMultiloc(appConfigurationLocales, (locale) => {
      return withoutSpacing`
        <h3>${formatMessageWithLocale(locale, title)}</h3>
        <p>${formatMessageWithLocale(locale, text)}</p>
      `;
    });
  };

  const toMultiloc = (message: MessageDescriptor) => {
    return createMultiloc(appConfigurationLocales, (locale) => {
      return formatMessageWithLocale(locale, message);
    });
  };

  const filteredSurveyQuestions = surveyQuestions
    ? surveyQuestions.data.filter((field) =>
        SURVEY_QUESTION_INPUT_TYPES.has(field.attributes.input_type)
      )
    : undefined;

  const genderField = userFields.data.find(
    (field) => field.attributes.code === 'gender'
  );
  const ageField = userFields.data.find(
    (field) => field.attributes.code === 'birthyear'
  );

  return (
    <Element id="project-report-template" is={Box} canvas>
      {/* About this report section */}
      <ImageMultilocWidget
        image={{
          imageUrl: appConfiguration.data.attributes.logo?.medium ?? undefined,
        }}
        stretch={false}
      />
      {reportTitleMultiloc && <TextMultiloc text={reportTitleMultiloc} />}
      <TextMultiloc text={aboutTextMultiloc} />
      <WhiteSpace />
      <TextMultiloc
        text={toMultilocParagraph(
          messages.reportSummary,
          messages.reportSummaryDescription
        )}
      />
      <WhiteSpace />
      <TextMultiloc
        text={toMultilocParagraph(
          messages.projectResults,
          messages.descriptionPlaceHolder
        )}
      />
      <WhiteSpace />
      <ActiveUsersWidget
        projectId={projectId}
        title={toMultiloc(WIDGET_TITLES.ActiveUsersWidget)}
        {...projectPeriod}
      />
      <WhiteSpace />
      {filteredSurveyQuestions?.map((question) => (
        <Element is={Container} canvas key={question.id}>
          <SurveyQuestionResultWidget
            projectId={projectId}
            phaseId={phaseId}
            questionId={question.id}
          />
          <WhiteSpace />
        </Element>
      ))}
      {participationMethod === 'ideation' && (
        <MostReactedIdeasWidget
          title={toMultiloc(WIDGET_TITLES.MostReactedIdeasWidget)}
          projectId={projectId}
          phaseId={phaseId}
          numberOfIdeas={5}
          collapseLongText={false}
        />
      )}
      {participationMethod === 'ideation' && <WhiteSpace />}
      <TextMultiloc
        text={toMultilocParagraph(
          messages.participants,
          messages.descriptionPlaceHolder
        )}
      />
      <WhiteSpace />
      <TwoColumn columnLayout="1-1">
        <Element id="left" is={Container} canvas>
          <DemographicsWidget
            projectId={projectId}
            customFieldId={genderField?.id}
            title={genderField?.attributes.title_multiloc}
            {...projectPeriod}
          />
        </Element>
        <Element id="right" is={Container} canvas>
          <DemographicsWidget
            projectId={projectId}
            customFieldId={ageField?.id}
            title={ageField?.attributes.title_multiloc}
            {...projectPeriod}
          />
        </Element>
      </TwoColumn>
      <TextMultiloc
        text={toMultilocParagraph(
          messages.visitors,
          messages.descriptionPlaceHolder
        )}
      />
      <WhiteSpace />
    </Element>
  );
};

const ProjectTemplate = ({ reportId, projectId }: Props) => {
  const enabled = useContext(TemplateContext);

  if (enabled) {
    return <ProjectTemplateContent reportId={reportId} projectId={projectId} />;
  } else {
    return <Element id="project-report-template" is={Box} canvas />;
  }
};

export default ProjectTemplate;

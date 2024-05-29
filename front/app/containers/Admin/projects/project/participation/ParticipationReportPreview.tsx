import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import { Element } from '@craftjs/core';

import usePhases from 'api/phases/usePhases';
import useUserCustomFields from 'api/user_custom_fields/useUserCustomFields';

import useLocale from 'hooks/useLocale';

import Editor from 'containers/Admin/reporting/components/ReportBuilder/Editor';
import ActiveUsersWidget from 'containers/Admin/reporting/components/ReportBuilder/Widgets/ChartWidgets/ActiveUsersWidget';
import CommentsByTimeWidget from 'containers/Admin/reporting/components/ReportBuilder/Widgets/ChartWidgets/CommentsByTimeWidget';
import DemographicsWidget from 'containers/Admin/reporting/components/ReportBuilder/Widgets/ChartWidgets/DemographicsWidget';
import { INPUT_TYPES } from 'containers/Admin/reporting/components/ReportBuilder/Widgets/ChartWidgets/DemographicsWidget/Settings';
import PostsByTimeWidget from 'containers/Admin/reporting/components/ReportBuilder/Widgets/ChartWidgets/PostsByTimeWidget';
import ReactionsByTimeWidget from 'containers/Admin/reporting/components/ReportBuilder/Widgets/ChartWidgets/ReactionsByTimeWidget';
import { MAX_REPORT_WIDTH } from 'containers/Admin/reporting/constants';
import { ReportContextProvider } from 'containers/Admin/reporting/context/ReportContext';

import ContentBuilderFrame from 'components/admin/ContentBuilder/Frame';
import WhiteSpace from 'components/admin/ContentBuilder/Widgets/WhiteSpace';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';

const ParticipationReportPreview = ({
  projectId,
  startAt,
  endAt,
}: {
  projectId: string;
  startAt?: string;
  endAt?: string;
}) => {
  const { data: phases } = usePhases(projectId);
  const { formatMessage } = useIntl();
  const locale = useLocale();

  const { data: userFields } = useUserCustomFields({ inputTypes: INPUT_TYPES });

  const hasIdeationPhase = phases?.data.some(
    (phase) => phase.attributes.participation_method === 'ideation'
  );

  if (!userFields) return null;

  return (
    <ReportContextProvider width="desktop">
      <Box maxWidth={MAX_REPORT_WIDTH} w="100%">
        <Editor isPreview={true}>
          <ContentBuilderFrame key={`${startAt} + ${endAt}`}>
            <ActiveUsersWidget
              startAt={startAt}
              endAt={endAt}
              projectId={projectId}
              title={{ [locale]: formatMessage(messages.participantsTimeline) }}
            />
            <WhiteSpace />
            {userFields?.data.map((field) => {
              return (
                <Box key={field.id}>
                  <DemographicsWidget
                    startAt={startAt}
                    endAt={endAt}
                    projectId={projectId}
                    customFieldId={field.id}
                    title={field.attributes.title_multiloc}
                  />
                  <WhiteSpace />
                </Box>
              );
            })}

            {hasIdeationPhase && (
              <Element is="div" canvas>
                <PostsByTimeWidget
                  startAt={startAt}
                  endAt={endAt}
                  projectId={projectId}
                  title={{ [locale]: formatMessage(messages.inputs) }}
                />
                <WhiteSpace />
                <CommentsByTimeWidget
                  startAt={startAt}
                  endAt={endAt}
                  projectId={projectId}
                  title={{ [locale]: formatMessage(messages.comments) }}
                />
                <WhiteSpace />
                <ReactionsByTimeWidget
                  startAt={startAt}
                  endAt={endAt}
                  projectId={projectId}
                  title={{ [locale]: formatMessage(messages.reactions) }}
                />
              </Element>
            )}
          </ContentBuilderFrame>
        </Editor>
      </Box>
    </ReportContextProvider>
  );
};

export default ParticipationReportPreview;

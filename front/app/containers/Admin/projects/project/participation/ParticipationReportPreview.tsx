import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import { Element } from '@craftjs/core';

import usePhases from 'api/phases/usePhases';

import useLocale from 'hooks/useLocale';

import Editor from 'containers/Admin/reporting/components/ReportBuilder/Editor';
import AgeWidget from 'containers/Admin/reporting/components/ReportBuilder/Widgets/ChartWidgets/_deprecated/AgeWidget';
import GenderWidget from 'containers/Admin/reporting/components/ReportBuilder/Widgets/ChartWidgets/_deprecated/GenderWidget';
import ActiveUsersWidget from 'containers/Admin/reporting/components/ReportBuilder/Widgets/ChartWidgets/ActiveUsersWidget';
import CommentsByTimeWidget from 'containers/Admin/reporting/components/ReportBuilder/Widgets/ChartWidgets/CommentsByTimeWidget';
import PostsByTimeWidget from 'containers/Admin/reporting/components/ReportBuilder/Widgets/ChartWidgets/PostsByTimeWidget';
import ReactionsByTimeWidget from 'containers/Admin/reporting/components/ReportBuilder/Widgets/ChartWidgets/ReactionsByTimeWidget';
import TwoColumn from 'containers/Admin/reporting/components/ReportBuilder/Widgets/TwoColumn';
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

  const hasIdeationPhase = phases?.data.some(
    (phase) => phase.attributes.participation_method === 'ideation'
  );

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
            <TwoColumn columnLayout="1-1">
              <GenderWidget
                startAt={startAt}
                endAt={endAt}
                projectId={projectId}
                title={{ [locale]: formatMessage(messages.usersByGender) }}
              />
              <AgeWidget
                startAt={startAt}
                endAt={endAt}
                projectId={projectId}
                title={{ [locale]: formatMessage(messages.usersByAge) }}
              />
            </TwoColumn>
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

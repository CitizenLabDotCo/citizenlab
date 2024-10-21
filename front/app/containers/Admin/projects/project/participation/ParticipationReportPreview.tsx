import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import { Element } from '@craftjs/core';

import usePhases from 'api/phases/usePhases';
import useUserCustomFields from 'api/user_custom_fields/useUserCustomFields';

import useLocale from 'hooks/useLocale';

import Editor from 'containers/Admin/reporting/components/ReportBuilder/Editor';
import { WIDGET_TITLES } from 'containers/Admin/reporting/components/ReportBuilder/Widgets';
import DemographicsWidget from 'containers/Admin/reporting/components/ReportBuilder/Widgets/ChartWidgets/DemographicsWidget';
import { INPUT_TYPES } from 'containers/Admin/reporting/components/ReportBuilder/Widgets/ChartWidgets/DemographicsWidget/Settings';
import ParticipantsWidget from 'containers/Admin/reporting/components/ReportBuilder/Widgets/ChartWidgets/ParticipantsWidget';
import ParticipationWidget from 'containers/Admin/reporting/components/ReportBuilder/Widgets/ChartWidgets/ParticipationWidget';
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
            <ParticipantsWidget
              startAt={startAt}
              endAt={endAt}
              projectId={projectId}
              title={{ [locale]: formatMessage(messages.participantsTimeline) }}
            />
            <WhiteSpace />
            {/* TODO: Fix this the next time the file is edited. */}
            {/* eslint-disable-next-line @typescript-eslint/no-unnecessary-condition */}
            {userFields?.data.map((field) => {
              return (
                <Element is="div" canvas key={field.id}>
                  <DemographicsWidget
                    // We don't filter by start and end date,
                    // because start and end date refer to the
                    // registration date of the user, not the
                    // participation date of the user.
                    projectId={projectId}
                    customFieldId={field.id}
                    title={field.attributes.title_multiloc}
                  />
                  <WhiteSpace />
                </Element>
              );
            })}
            {hasIdeationPhase && (
              <Element is="div" canvas>
                <ParticipationWidget
                  startAt={startAt}
                  endAt={endAt}
                  projectId={projectId}
                  title={{
                    [locale]: formatMessage(WIDGET_TITLES.ParticipationWidget),
                  }}
                  participationTypes={{
                    comments: true,
                    votes: false,
                    inputs: true,
                  }}
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

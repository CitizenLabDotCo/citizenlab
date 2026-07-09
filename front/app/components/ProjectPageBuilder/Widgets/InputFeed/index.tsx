import React, { Suspense } from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import { useEditor } from '@craftjs/core';

import usePhases from 'api/phases/usePhases';
import { getLatestRelevantPhase, hideTimelineUI } from 'api/phases/utils';
import useProjectById from 'api/projects/useProjectById';

import useLocale from 'hooks/useLocale';

import { usePermission } from 'utils/permissions';
import { useParams } from 'utils/router';

import EditModeHeightCap from '../EditModeHeightCap';
import SectionBackground from '../SectionBackground';
import useWidgetProjectId from '../useWidgetProjectId';

import EmptyInputFeed from './EmptyInputFeed';

const PublicInputContent = React.lazy(() => import('./PublicInputContent'));

const InputFeedSection = () => {
  const projectId = useWidgetProjectId();
  const { slug } = useParams({ strict: false }) as { slug?: string };
  const onPublicRoute = !!slug;
  const { enabled: inEditor } = useEditor((state) => ({
    enabled: state.options.enabled,
  }));
  const currentLocale = useLocale();
  const { data: project } = useProjectById(projectId);
  const canModerate = usePermission({
    item: project?.data ?? null,
    action: 'moderate',
  });
  const { data: phases } = usePhases(projectId);
  const hasParticipation = !!phases && !!getLatestRelevantPhase(phases.data);
  // With the timeline above hidden, this is the first content on the grey band
  // and needs the top padding the timeline normally provides.
  const startsGreyBand = !!phases && hideTimelineUI(phases.data, currentLocale);

  return (
    <Box
      id="e2e-project-page-input-feed"
      pointerEvents={onPublicRoute ? 'auto' : 'none'}
      // Keep the Phases widget selectable in the builder even when there is no
      // active phase (and so no content renders).
      minHeight={inEditor ? '40px' : undefined}
    >
      {projectId &&
        phases &&
        (hasParticipation ? (
          // Shares the timeline's grey band so phases + participation content
          // read as one section; only wraps real content, so empty phases
          // leave no grey strip.
          <EditModeHeightCap>
            <SectionBackground
              fullBleed={onPublicRoute}
              pb="40px"
              pt={startsGreyBand ? '40px' : undefined}
            >
              <Suspense fallback={null}>
                <PublicInputContent projectId={projectId} />
              </Suspense>
            </SectionBackground>
          </EditModeHeightCap>
        ) : canModerate ? (
          <EmptyInputFeed />
        ) : null)}
    </Box>
  );
};

export default InputFeedSection;

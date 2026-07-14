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
import useIsPageBodyChild from '../useIsPageBodyChild';
import useWidgetProjectId from '../useWidgetProjectId';

import EmptyInputFeed from './EmptyInputFeed';

const PublicInputContent = React.lazy(() => import('./PublicInputContent'));

const InputFeedSection = () => {
  const projectId = useWidgetProjectId();
  const isPageBodyChild = useIsPageBodyChild();
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
  const startsGreyBand = !!phases && hideTimelineUI(phases.data, currentLocale);

  return (
    <Box
      id="e2e-project-page-input-feed"
      pointerEvents={onPublicRoute ? 'auto' : 'none'}
      minHeight={inEditor ? '40px' : undefined}
    >
      {projectId &&
        phases &&
        (hasParticipation ? (
          <EditModeHeightCap>
            <SectionBackground
              fullBleed={onPublicRoute && isPageBodyChild}
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

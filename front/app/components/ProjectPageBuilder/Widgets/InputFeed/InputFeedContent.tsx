import React, { Suspense } from 'react';

import usePhases from 'api/phases/usePhases';
import { getLatestRelevantPhase, hideTimelineUI } from 'api/phases/utils';
import useProjectById from 'api/projects/useProjectById';

import useLocale from 'hooks/useLocale';

import useWidgetProjectId from 'components/admin/ContentBuilder/useWidgetProjectId';

import { usePermission } from 'utils/permissions';
import { useParams } from 'utils/router';

import EditModeHeightCap from '../EditModeHeightCap';
import EmptyParticipationPreview from '../EmptyState/EmptyParticipationPreview';
import SectionBackground from '../SectionBackground';
import useIsPageBodyChild from '../useIsPageBodyChild';

const PublicInputContent = React.lazy(() => import('./PublicInputContent'));

const InputFeedContent = () => {
  const projectId = useWidgetProjectId();
  const isPageBodyChild = useIsPageBodyChild();
  const { slug } = useParams({ strict: false }) as { slug?: string };
  const currentLocale = useLocale();
  const { data: project } = useProjectById(projectId);
  const canModerate = usePermission({
    item: project?.data ?? null,
    action: 'moderate',
  });
  const { data: phases } = usePhases(projectId);

  if (!projectId || !phases) return null;

  if (!getLatestRelevantPhase(phases.data)) {
    return canModerate ? <EmptyParticipationPreview /> : null;
  }

  const startsGreyBand = hideTimelineUI(phases.data, currentLocale);

  return (
    <EditModeHeightCap>
      <SectionBackground
        fullBleed={!!slug && isPageBodyChild}
        pb="40px"
        pt={startsGreyBand ? '40px' : undefined}
      >
        <Suspense fallback={null}>
          <PublicInputContent projectId={projectId} />
        </Suspense>
      </SectionBackground>
    </EditModeHeightCap>
  );
};

export default InputFeedContent;

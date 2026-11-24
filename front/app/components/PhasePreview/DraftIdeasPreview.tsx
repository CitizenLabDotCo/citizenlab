import React, { useState } from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import { IPhaseData, PresentationMode } from 'api/phases/types';
import { getSelectedView } from 'api/phases/utils';

import IdeasView from 'components/IdeaCards/shared/IdeasView';
import EmptyIdeas from 'components/IdeaCards/shared/IdeasView/EmptyIdeas';
import ViewButtons from 'components/PostCardsComponents/ViewButtons';

import { usePhasePreview } from 'utils/phasePreview/runtime';

import PreviewSkeleton from './PreviewSkeleton';

const DraftIdeasPreview = ({ phase }: { phase: IPhaseData }) => {
  const [requestedView, setRequestedView] = useState<PresentationMode>();
  const { available_views: availableViews, presentation_mode: defaultView } =
    phase.attributes;
  const view = getSelectedView({ requestedView, availableViews, defaultView });
  const preview = usePhasePreview();

  return (
    <Box p="20px" display="flex" flexDirection="column" gap="12px">
      <ViewButtons
        selectedView={view}
        availableViews={availableViews}
        onClick={setRequestedView}
      />
      {view === 'map' ? (
        <IdeasView
          view={view}
          projectId={phase.relationships.project.data.id}
          phaseId={phase.id}
          list={[]}
          hideImage
          hideImagePlaceholder
          hideIdeaStatus
          querying={false}
          hasMore={false}
          loadingMore={false}
          onLoadMore={() => {}}
        />
      ) : (
        <Box id={view === 'feed' ? 'view-panel-3' : 'view-panel-1'}>
          {preview?.lifecycle === 'open' ? (
            <EmptyIdeas />
          ) : (
            <PreviewSkeleton
              kind={view === 'feed' ? 'perspectives' : 'cards'}
            />
          )}
        </Box>
      )}
    </Box>
  );
};

export default DraftIdeasPreview;

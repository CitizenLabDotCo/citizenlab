import React, { useMemo } from 'react';

import { Box, Spinner, useBreakpoint } from '@citizenlab/cl2-component-library';
import { isEmpty } from 'lodash-es';

import useProjectPageLayout from 'api/content_builder/useProjectPageLayout';

import useParallelParticipation from 'hooks/useParallelParticipation';

import { IMAGES_LOADED_EVENT } from 'components/admin/ContentBuilder/constants';
import { ContentBuilderLayoutProvider } from 'components/admin/ContentBuilder/context/ContentBuilderLayoutContext';
import ContentBuilderFrame from 'components/admin/ContentBuilder/Frame';
import { ensureLockedHeaderNodes } from 'components/ProjectPageBuilder/defaultLayout';
import Editor from 'components/ProjectPageBuilder/Editor';

import eventEmitter from 'utils/eventEmitter';

type Props = {
  projectId: string;
};

const handleLoadImages = () => {
  eventEmitter.emit(IMAGES_LOADED_EVENT);
};

// Read-only renderer for the project page layout on the public project page.
// Gated by parallel_participation; renders nothing until the layout exists.
const ProjectPageContentViewer = ({ projectId }: Props) => {
  const isSmallerThanTablet = useBreakpoint('tablet');
  const parallelParticipation = useParallelParticipation();

  const { data: layout, isInitialLoading } = useProjectPageLayout(
    projectId,
    parallelParticipation
  );

  // Render with the locked Banner + Title at the top, injecting them into
  // layouts that predate these widgets. Memoised so the frame doesn't re-deserialize.
  const editorData = useMemo(
    () => ensureLockedHeaderNodes(layout?.data.attributes.craftjs_json),
    [layout]
  );

  if (!parallelParticipation) return null;
  if (isInitialLoading) return <Spinner />;

  const hasContent =
    layout &&
    layout.data.attributes.enabled &&
    !isEmpty(layout.data.attributes.craftjs_json);

  if (!hasContent) return null;

  return (
    <Box
      data-testid="projectPageBuilderContent"
      id={`project-page-${projectId}`}
      mx={isSmallerThanTablet ? '-20px' : '0px'}
    >
      <ContentBuilderLayoutProvider layoutId={layout.data.id}>
        <Editor isPreview={true}>
          <ContentBuilderFrame
            editorData={editorData}
            onLoadImages={handleLoadImages}
          />
        </Editor>
      </ContentBuilderLayoutProvider>
    </Box>
  );
};

export default ProjectPageContentViewer;

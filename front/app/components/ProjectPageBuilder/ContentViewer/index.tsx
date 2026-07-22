import React, { useMemo } from 'react';

import { Box, Spinner, useBreakpoint } from '@citizenlab/cl2-component-library';
import { isEmpty } from 'lodash-es';

import useProjectPageLayout from 'api/project_page_layout/useProjectPageLayout';
import useProjectById from 'api/projects/useProjectById';

import { IMAGES_LOADED_EVENT } from 'components/admin/ContentBuilder/constants';
import { ContentBuilderLayoutProvider } from 'components/admin/ContentBuilder/context/ContentBuilderLayoutContext';
import ContentBuilderFrame from 'components/admin/ContentBuilder/Frame';
import { normalizeProjectPageLayout } from 'components/ProjectPageBuilder/defaultLayout';
import Editor from 'components/ProjectPageBuilder/Editor';

import eventEmitter from 'utils/eventEmitter';
import { usePermission } from 'utils/permissions';

type Props = {
  projectId: string;
};

const handleLoadImages = () => {
  eventEmitter.emit(IMAGES_LOADED_EVENT);
};

const ProjectPageContentViewer = ({ projectId }: Props) => {
  const isSmallerThanTablet = useBreakpoint('tablet');
  const { data: project } = useProjectById(projectId);
  const canModerate = usePermission({
    item: project?.data ?? null,
    action: 'moderate',
  });

  const { data: layout, isInitialLoading } = useProjectPageLayout(projectId);

  const editorData = useMemo(
    () => normalizeProjectPageLayout(layout?.data.attributes.craftjs_json),
    [layout]
  );

  if (isInitialLoading) return <Spinner />;

  const hasContent =
    layout &&
    layout.data.attributes.enabled &&
    !isEmpty(layout.data.attributes.craftjs_json);

  if (!hasContent && !canModerate) return null;

  return (
    <Box
      data-testid="projectPageBuilderContent"
      id={`project-page-${projectId}`}
      mx={isSmallerThanTablet ? '-20px' : '0px'}
    >
      <ContentBuilderLayoutProvider layoutId={layout?.data.id}>
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

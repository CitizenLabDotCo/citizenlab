import React from 'react';

import {
  Box,
  Spinner,
  Title,
  useBreakpoint,
} from '@citizenlab/cl2-component-library';
import { isEmpty } from 'lodash-es';
import { Multiloc } from 'typings';

import useProjectPageLayout from 'api/content_builder/useProjectPageLayout';

import useLocalize from 'hooks/useLocalize';
import useParallelParticipation from 'hooks/useParallelParticipation';

import { IMAGES_LOADED_EVENT } from 'components/admin/ContentBuilder/constants';
import { ContentBuilderLayoutProvider } from 'components/admin/ContentBuilder/context/ContentBuilderLayoutContext';
import ContentBuilderFrame from 'components/admin/ContentBuilder/Frame';
import Editor from 'components/ProjectPageBuilder/Editor';

import eventEmitter from 'utils/eventEmitter';

type Props = {
  projectId: string;
  projectTitle: Multiloc;
};

const handleLoadImages = () => {
  eventEmitter.emit(IMAGES_LOADED_EVENT);
};

// Read-only renderer for the project page layout on the public project page.
// Gated by parallel_participation; renders nothing until the layout exists.
const ProjectPageContentViewer = ({ projectId, projectTitle }: Props) => {
  const localize = useLocalize();
  const isSmallerThanTablet = useBreakpoint('tablet');
  const parallelParticipation = useParallelParticipation();

  const { data: layout, isInitialLoading } = useProjectPageLayout(
    projectId,
    parallelParticipation
  );

  if (!parallelParticipation) return null;
  if (isInitialLoading) return <Spinner />;

  const hasContent =
    layout &&
    layout.data.attributes.enabled &&
    !isEmpty(layout.data.attributes.craftjs_json);

  if (!hasContent) return null;

  return (
    <Box data-testid="projectPageBuilderContent">
      <Title color="tenantText" variant="h1">
        {localize(projectTitle)}
      </Title>
      <Box
        id={`project-page-${projectId}`}
        mx={isSmallerThanTablet ? '-20px' : '0px'}
      >
        <ContentBuilderLayoutProvider layoutId={layout.data.id}>
          <Editor isPreview={true}>
            <ContentBuilderFrame
              editorData={layout.data.attributes.craftjs_json}
              onLoadImages={handleLoadImages}
            />
          </Editor>
        </ContentBuilderLayoutProvider>
      </Box>
    </Box>
  );
};

export default ProjectPageContentViewer;

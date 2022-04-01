import React, { useEffect } from 'react';
import { withRouter, WithRouterProps } from 'react-router';

// Hooks
import useProject from 'hooks/useProject';
import useFeatureFlag from 'hooks/useFeatureFlag';
import useContentBuilderLayout from '../../../hooks/useContentBuilder';
import useLocale from 'hooks/useLocale';

// Components
import Editor from '../Editor';
import ContentBuilderFrame from '../ContentBuilderFrame';
import { Box } from '@citizenlab/cl2-component-library';
import ProjectInfo from 'containers/ProjectsShowPage/shared/header/ProjectInfo';
import { isNilOrError } from 'utils/helperUtils';

// services
import { PROJECT_DESCRIPTION_CODE } from '../../../services/contentBuilder';

type ContentBuilderPreviewProps = {
  onMount: () => void;
} & WithRouterProps;

const ContentBuilderPreviewContainer = ({
  onMount,
  params: { slug },
}: ContentBuilderPreviewProps) => {
  const project = useProject({ projectSlug: slug });
  const featureEnabled = useFeatureFlag({ name: 'content_builder' });

  useEffect(() => {
    if (!featureEnabled) return;
    onMount();
  }, [onMount, featureEnabled]);

  if (!featureEnabled) {
    return null;
  }

  if (isNilOrError(project)) return null;

  return <ContentBuilderPreview projectId={project.id} />;
};

const ContentBuilderPreview = ({ projectId }: { projectId: string }) => {
  const locale = useLocale();

  const contentBuilderLayout = useContentBuilderLayout({
    projectId,
    code: PROJECT_DESCRIPTION_CODE,
  });

  if (isNilOrError(locale)) return null;

  const contentBuilderContent =
    !isNilOrError(contentBuilderLayout) &&
    contentBuilderLayout.data.attributes.craftjs_jsonmultiloc[locale];

  console.log(contentBuilderContent);
  return (
    <Box>
      {contentBuilderContent ? (
        <Editor isPreview={true}>
          <ContentBuilderFrame projectId={projectId} />
        </Editor>
      ) : (
        <ProjectInfo projectId={projectId} />
      )}
    </Box>
  );
};
export default withRouter(ContentBuilderPreviewContainer);

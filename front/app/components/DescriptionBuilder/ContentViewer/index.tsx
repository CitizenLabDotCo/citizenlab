import React from 'react';

import { DescriptionModelType } from 'api/content_builder/types';
import { IProjectFolderData } from 'api/project_folders/types';
import { IProjectData } from 'api/projects/types';

import useFeatureFlag from 'hooks/useFeatureFlag';

import FolderViewer from 'components/DescriptionBuilder/ContentViewer/Viewer/FolderViewer';

import ProjectViewer from './Viewer/ProjectViewer';

interface Props {
  model: IProjectData | IProjectFolderData;
  modelType: DescriptionModelType;
}

const ContentViewer = ({ model, modelType }: Props) => {
  const featureEnabled = useFeatureFlag({
    name: 'project_description_builder',
  });

  if (!featureEnabled) return null;

  if (modelType === 'folder') {
    return (
      <FolderViewer
        folderId={model.id}
        folderTitle={model.attributes.title_multiloc}
      />
    );
  }
  return (
    <ProjectViewer
      projectId={model.id}
      projectTitle={model.attributes.title_multiloc}
    />
  );
};

export default ContentViewer;

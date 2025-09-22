import React from 'react';

import { ProjectDescriptionModelType } from 'api/project_description_builder/types';
import { IProjectFolderData } from 'api/project_folders/types';
import { IProjectData } from 'api/projects/types';

import useFeatureFlag from 'hooks/useFeatureFlag';

import FolderViewer from 'components/ProjectDescriptionBuilder/ContentViewer/Viewer/FolderViewer';

import ProjectViewer from './Viewer/ProjectViewer';

interface Props {
  model: IProjectData | IProjectFolderData;
  modelType: ProjectDescriptionModelType;
}

const ContentViewer = ({ model, modelType }: Props) => {
  const featureEnabled = useFeatureFlag({
    name: 'project_description_builder',
  });

  if (!featureEnabled || !model) {
    return null;
  }

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

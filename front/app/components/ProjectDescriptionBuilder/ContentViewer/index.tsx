import React from 'react';

import useFeatureFlag from 'hooks/useFeatureFlag';

import ProjectViewer from './Viewer/ProjectViewer';
import { IProjectData } from 'api/projects/types';
import { IProjectFolderData } from 'api/project_folders/types';
import { ProjectDescriptionModelType } from 'api/project_description_builder/types';
import FolderViewer from 'components/ProjectDescriptionBuilder/ContentViewer/Viewer/FolderViewer';

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

  if (modelType == 'folder') {
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

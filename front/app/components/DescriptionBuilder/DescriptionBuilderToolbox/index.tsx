import React from 'react';

import { SupportedLocale } from 'typings';

import { ProjectDescriptionModelType } from 'api/project_description_builder/types';
import FolderDescriptionBuilderToolbox from 'components/DescriptionBuilder/DescriptionBuilderToolbox/FolderDescriptionBuilderToolbox';
import ProjectDescriptionBuilderToolbox from 'components/DescriptionBuilder/DescriptionBuilderToolbox/ProjectDescriptionBuilderToolbox';

type DescriptionBuilderToolboxProps = {
  selectedLocale: SupportedLocale;
  modelId: string;
  modelType: ProjectDescriptionModelType;
};

const DescriptionBuilderToolbox = ({
  selectedLocale,
  modelId,
  modelType,
}: DescriptionBuilderToolboxProps) => {
  // Folder
  if (modelType === 'folder') {
    return (
      <FolderDescriptionBuilderToolbox
        selectedLocale={selectedLocale}
        folderId={modelId}
      />
    );
  }

  // Project
  return <ProjectDescriptionBuilderToolbox selectedLocale={selectedLocale} />;
};

export default DescriptionBuilderToolbox;

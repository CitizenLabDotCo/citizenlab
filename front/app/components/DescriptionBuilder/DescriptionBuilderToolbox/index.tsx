import React from 'react';

import { SupportedLocale } from 'typings';

import { DescriptionModelType } from 'api/content_builder/types';

import FolderDescriptionBuilderToolbox from 'components/DescriptionBuilder/DescriptionBuilderToolbox/FolderDescriptionBuilderToolbox';
import ProjectDescriptionBuilderToolbox from 'components/DescriptionBuilder/DescriptionBuilderToolbox/ProjectDescriptionBuilderToolbox';

type DescriptionBuilderToolboxProps = {
  selectedLocale: SupportedLocale;
  modelId: string;
  modelType: DescriptionModelType;
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

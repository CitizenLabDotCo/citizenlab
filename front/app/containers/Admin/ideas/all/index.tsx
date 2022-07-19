import React, { memo, useState } from 'react';
import { adopt } from 'react-adopt';
import { isNilOrError } from 'utils/helperUtils';
import { UploadFile } from 'typings';

// components
import PostManager, { TFilterMenu } from 'components/admin/PostManager';
import FileUploader from 'components/UI/FileUploader';

// resources
import GetProjects, { GetProjectsChildProps } from 'resources/GetProjects';
import { PublicationStatus } from 'services/projects';
import { addIdeaImportFile } from 'services/ideaFiles';

interface DataProps {
  projects: GetProjectsChildProps;
}

export interface Props extends DataProps {}

const IdeasTab = memo(({ projects }: Props) => {
  const defaultFilterMenu: TFilterMenu = 'projects';
  const visibleFilterMenus: TFilterMenu[] = [
    defaultFilterMenu,
    'topics',
    'statuses',
  ];
  const [files, setFiles] = useState<UploadFile[]>([]);

  const handleFileOnAdd = (fileToAdd: UploadFile) => {
    addIdeaImportFile(fileToAdd.base64);
    setFiles((files) => [...files, fileToAdd]);
  };
  const err = { idea: [{ error: 'This is an error' }] };

  if (!isNilOrError(projects) && projects.projectsList !== undefined) {
    return (
      <>
        <FileUploader
          id={'bulk_idea_import'}
          onFileRemove={() => {}}
          onFileAdd={handleFileOnAdd}
          apiErrors={err}
          files={files}
        />
        <PostManager
          type="AllIdeas"
          defaultFilterMenu={defaultFilterMenu}
          visibleFilterMenus={visibleFilterMenus}
          projects={projects.projectsList}
        />
      </>
    );
  }

  return null;
});

const publicationStatuses: PublicationStatus[] = [
  'draft',
  'published',
  'archived',
];

const Data = adopt<Props>({
  projects: (
    <GetProjects
      pageSize={250}
      sort="new"
      publicationStatuses={publicationStatuses}
      filterCanModerate={true}
    />
  ),
});

export default () => (
  <Data>{(dataProps: DataProps) => <IdeasTab {...dataProps} />}</Data>
);

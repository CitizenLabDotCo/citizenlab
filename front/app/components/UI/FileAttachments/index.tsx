import React from 'react';

import { IEventFileData } from 'api/event_files/types';
import { IIdeaFileData } from 'api/idea_files/types';
import { IPageFileData } from 'api/page_files/types';
import { IPhaseFileData } from 'api/phase_files/types';
import { IProjectFileData } from 'api/project_files/types';
import { IProjectFolderFileData } from 'api/project_folder_files/types';

import FileDisplay from './FileDisplay';

interface Props {
  files:
    | IProjectFileData[]
    | IPhaseFileData[]
    | IEventFileData[]
    | IPageFileData[]
    | IIdeaFileData[]
    | IProjectFolderFileData[];
  className?: string;
}

const FileAttachments = ({ files, className }: Props) => {
  return (
    <div className={className}>
      {Array.isArray(files) &&
        files.map((file) => <FileDisplay key={file.id} file={file} />)}
    </div>
  );
};

export default FileAttachments;

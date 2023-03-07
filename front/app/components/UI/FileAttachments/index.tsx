import React from 'react';
import FileDisplay from './FileDisplay';
import { IProjectFileData } from 'services/projectFiles';
import { IPhaseFileData } from 'services/phaseFiles';
import { IEventFileData } from 'api/event_files/types';
import { ICustomPageFileData } from 'services/pageFiles';
import { IIdeaFileData } from 'services/ideaFiles';
import { IInitiativeFileData } from 'services/initiativeFiles';

interface Props {
  files:
    | IProjectFileData[]
    | IPhaseFileData[]
    | IEventFileData[]
    | ICustomPageFileData[]
    | IIdeaFileData[]
    | IInitiativeFileData[];
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

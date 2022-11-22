import React from 'react';
import { IEventFileData } from 'services/eventFiles';
import { ICustomPageFileData } from 'services/pageFiles';
import { IIdeaFileData } from 'services/ideaFiles';
import { IInitiativeFileData } from 'services/initiativeFiles';
import { IPageFileData } from 'services/pageFiles';
import { IPhaseFileData } from 'services/phaseFiles';
import { IProjectFileData } from 'services/projectFiles';
import styled from 'styled-components';
import FileDisplay from './FileDisplay';

const Container = styled.div`
  margin-top: 25px;
`;

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
    <Container className={className}>
      {Array.isArray(files) &&
        files.map((file) => <FileDisplay key={file.id} file={file} />)}
    </Container>
  );
};

export default FileAttachments;

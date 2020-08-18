import React from 'react';
import styled from 'styled-components';
import FileDisplay from './FileDisplay';
import { IProjectFileData } from 'services/projectFiles';
import { IPhaseFileData } from 'services/phaseFiles';
import { IEventFileData } from 'services/eventFiles';
import { IPageFileData } from 'services/pageFiles';
import { IIdeaFileData } from 'services/ideaFiles';
import { IInitiativeFileData } from 'services/initiativeFiles';

const Container = styled.div`
  margin-top: 25px;
`;

interface Props {
  files:
    | IProjectFileData[]
    | IPhaseFileData[]
    | IEventFileData[]
    | IPageFileData[]
    | IIdeaFileData[]
    | IInitiativeFileData[];
  className?: string;
}

// Note on 18/8/2020: we should make this component more reusable by making the component that is now FileDisplay a prop.
// I'm making a new Attachments component in the IdeasShow/MetaInformation folder that is more reusable and could later
// serve as the replacement for this component
// Also, as a PS, Containers/outer elements of reusable elements should never contain margin as this one.

const FileAttachments = ({ files, className }: Props) => {
  return (
    <Container className={className}>
      {Array.isArray(files) &&
        files.map((file) => <FileDisplay key={file.id} file={file} />)}
    </Container>
  );
};

export default FileAttachments;

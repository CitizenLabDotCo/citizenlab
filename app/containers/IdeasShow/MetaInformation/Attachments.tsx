import React from 'react';
import styled from 'styled-components';
import { IPhaseFileData } from 'services/phaseFiles';
import { IEventFileData } from 'services/eventFiles';
import { IIdeaFileData } from 'services/ideaFiles';
import Attachment from './Attachment';

const Container = styled.div``;

interface Props {
  files: IPhaseFileData[]
    | IIdeaFileData[]
    | IEventFileData[]
  className?: string;
  // fileDisplayElement: JSX.Element;
}

const Attachments = ({ files, className /*, fileDisplayElement */ }: Props) => {
  return (
    <Container className={className}>
      {Array.isArray(files) &&
        files.map((file) => <Attachment file={file} key={file.id} />)
      }
      {/* files.map((file) => React.cloneElement(fileDisplayElement, {file, key: file.id }))} */}
    </Container>
  );
};

export default Attachments;

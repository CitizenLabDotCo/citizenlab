import React from 'react';
import styled from 'styled-components';
import { IPhaseFileData } from 'services/phaseFiles';
import { IEventFileData } from 'services/eventFiles';
import { IIdeaFileData } from 'services/ideaFiles';
import Attachment from './Attachment';

const Container = styled.div``;
const StyledAttachment = styled(Attachment)<{ isLastItem: boolean }>`
  margin-bottom: ${({ isLastItem }) => (!isLastItem ? '10px' : '0')};
`;

interface Props {
  files: IPhaseFileData[] | IIdeaFileData[] | IEventFileData[];
  className?: string;
}

const Attachments = ({ files, className }: Props) => {
  return (
    <Container className={className}>
      {Array.isArray(files) &&
        files.map((file, index) => (
          <StyledAttachment
            isLastItem={index === files.length - 1}
            file={file}
            key={file.id}
          />
        ))}
    </Container>
  );
};

export default Attachments;

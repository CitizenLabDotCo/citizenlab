import React, { memo } from 'react';
import styled from 'styled-components';
import { IPhaseFileData } from 'api/phase_files/types';
import { IEventFileData } from 'api/event_files/types';
import { IIdeaFileData } from 'api/idea_files/types';
import { darken } from 'polished';

// components
import { Icon, colors, media } from '@citizenlab/cl2-component-library';

const Container = styled.div`
  display: flex;
  align-items: center;
`;

const FileDownloadLink = styled.a`
  color: ${colors.textSecondary};
  display: inline-block;
  margin-right: 10px;
  hyphens: auto;
  text-decoration: underline;

  &:hover {
    color: ${darken(0.2, colors.textSecondary)};
    text-decoration: underline;
  }

  ${media.phone`
    margin-right: 0;
  `}
`;

const PaperclipIcon = styled(Icon)`
  fill: ${colors.textSecondary};
  margin-right: 10px;
`;

export interface Props {
  className?: string;
  file: IPhaseFileData | IIdeaFileData | IEventFileData;
}

const Attachment = memo<Props>(({ className, file }) => {
  return (
    <Container className={className}>
      <PaperclipIcon name="paperclip" ariaHidden />
      <FileDownloadLink
        href={file.attributes.file.url}
        download={file.attributes.name}
        target="_blank"
        rel="noopener noreferrer"
      >
        {file.attributes.name}
      </FileDownloadLink>
    </Container>
  );
});

export default Attachment;

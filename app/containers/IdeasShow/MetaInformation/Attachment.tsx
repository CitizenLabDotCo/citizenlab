import React, { memo } from 'react';
import styled from 'styled-components';
import { IPhaseFileData } from 'services/phaseFiles';
import { IEventFileData } from 'services/eventFiles';
import { IIdeaFileData } from 'services/ideaFiles';
import { darken } from 'polished';

// components
import { Icon, colors, media } from 'cl2-component-library';

const Container = styled.div`
  display: flex;
  align-items: center;
`;

const FileDownloadLink = styled.a`
  color: ${colors.label};
  display: inline-block;
  margin-right: 10px;
  hyphens: auto;
  text-decoration: underline;

  &:hover {
    color: ${darken(0.2, colors.label)};
    text-decoration: underline;
  }

  ${media.smallerThanMinTablet`
    margin-right: auto;
  `}
`;

const PaperclipIcon = styled(Icon)`
  width: 12px;
  height: 20px;
  fill: ${colors.label};
  margin-right: 10px;
`;

export interface Props {
  className?: string;
  file: IPhaseFileData | IIdeaFileData | IEventFileData;
}

const DropdownMap = memo<Props>(({ className, file }) => {
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

export default DropdownMap;

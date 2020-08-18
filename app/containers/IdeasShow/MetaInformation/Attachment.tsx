import React, { memo } from 'react';
import styled from 'styled-components';
import { IPhaseFileData } from 'services/phaseFiles';
import { IEventFileData } from 'services/eventFiles';
import { IIdeaFileData } from 'services/ideaFiles';

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

  &:hover {
    color: inherit;
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
  margin-right: 8px;
`;

export interface Props {
  file: IPhaseFileData
    | IIdeaFileData
    | IEventFileData
}

const DropdownMap = memo<Props>(
  ({ file }) => {
    return (
      <Container>
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
  }
);

export default DropdownMap;

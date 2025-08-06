import React from 'react';

import {
  colors,
  fontSizes,
  media,
  Icon,
} from '@citizenlab/cl2-component-library';
import { lighten } from 'polished';
import styled from 'styled-components';

import { IEventFileData } from 'api/event_files/types';
import { IFileData } from 'api/files/types';
import { IIdeaFileData } from 'api/idea_files/types';
import { IPageFileData } from 'api/page_files/types';
import { IPhaseFileData } from 'api/phase_files/types';
import { IProjectFileData } from 'api/project_files/types';

import { returnFileSize } from 'utils/fileUtils';
import { isNilOrError } from 'utils/helperUtils';

const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: ${colors.textSecondary};
  border: 1px solid ${lighten(0.4, colors.textSecondary)};
  border-radius: ${(props) => props.theme.borderRadius};
  font-size: ${fontSizes.base}px;
  line-height: 24px;
  padding: 10px 20px;
  margin-bottom: 10px;
`;

const Paperclip = styled(Icon)`
  fill: ${colors.textSecondary};
  margin-right: 15px;
  ${media.phone`
    width: 40px;
  `}
`;

const FileDownloadLink = styled.a`
  color: ${colors.textSecondary};
  text-decoration: underline;
  display: inline-block;
  margin-right: 10px;
  hyphens: auto;
  word-break: break-word;

  &:hover {
    color: #000;
    text-decoration: underline;
  }

  ${media.phone`
    margin-right: auto;
  `}
`;

const Spacer = styled.div`
  flex: 1;
`;

const FileSize = styled.span`
  margin-left: 20px;
  white-space: nowrap;

  ${media.phone`
    display: none;
  `}
`;

interface Props {
  file?:
    | IProjectFileData
    | IPhaseFileData
    | IPageFileData
    | IEventFileData
    | IIdeaFileData;
  fileNewType?: IFileData; // TODO: Rename this prop to "file" and remove the old code after BE changes.
  className?: string;
}

const FileDisplay = ({ file, fileNewType, className }: Props) => {
  if (!isNilOrError(fileNewType)) {
    const {
      content: { url },
      name,
      size,
    } = fileNewType.attributes;
    return (
      <Container className={className}>
        <Paperclip name="paperclip" />
        <FileDownloadLink
          href={url}
          download={name}
          target="_blank"
          rel="noopener noreferrer"
        >
          {name}
        </FileDownloadLink>
        <Spacer />
        {size && <FileSize>({returnFileSize(size)})</FileSize>}
      </Container>
    );
  }

  if (!isNilOrError(file)) {
    const {
      file: { url },
      name,
      size,
    } = file.attributes;
    return (
      <Container className={className}>
        <Paperclip name="paperclip" />
        <FileDownloadLink
          href={url}
          download={name}
          target="_blank"
          rel="noopener noreferrer"
        >
          {name}
        </FileDownloadLink>
        <Spacer />
        {size && <FileSize>({returnFileSize(size)})</FileSize>}
      </Container>
    );
  }

  return null;
};

export default FileDisplay;

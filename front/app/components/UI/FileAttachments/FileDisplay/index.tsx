import React from 'react';
import { isNilOrError } from 'utils/helperUtils';
import { returnFileSize } from 'utils/fileUtils';

// styles
import styled from 'styled-components';
import { colors, fontSizes, media } from 'utils/styleUtils';
import { lighten } from 'polished';

// components
import { Icon } from '@citizenlab/cl2-component-library';

// services
import { IProjectFileData } from 'services/projectFiles';
import { IPhaseFileData } from 'services/phaseFiles';
import { IEventFileData } from 'services/eventFiles';
import { IPageFileData } from 'services/pageFiles';
import { IIdeaFileData } from 'services/ideaFiles';

const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: ${colors.label};
  border: 1px solid ${lighten(0.4, colors.label)};
  border-radius: ${(props: any) => props.theme.borderRadius};
  font-size: ${fontSizes.base}px;
  line-height: 24px;
  padding: 10px 20px;
  margin-bottom: 10px;
`;

const Paperclip = styled(Icon)`
  min-width: 10px;
  min-height: 20px;
  width: 10px;
  height: 20px;
  fill: ${colors.label};
  margin-right: 15px;
`;

const FileDownloadLink = styled.a`
  color: ${colors.label};
  text-decoration: underline;
  display: inline-block;
  margin-right: 10px;
  hyphens: auto;

  &:hover {
    color: #000;
    text-decoration: underline;
  }

  ${media.smallerThanMinTablet`
    margin-right: auto;
  `}
`;

const Spacer = styled.div`
  flex: 1;
`;

const FileSize = styled.span`
  margin-left: 20px;
  white-space: nowrap;

  ${media.smallerThanMinTablet`
    display: none;
  `}
`;

interface Props {
  file:
    | IProjectFileData
    | IPhaseFileData
    | IPageFileData
    | IEventFileData
    | IIdeaFileData;
  className?: string;
}

const FileDisplay = ({ file, className }: Props) => {
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

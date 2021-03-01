import React from 'react';
import { returnFileSize, isNilOrError } from 'utils/helperUtils';

// styles
import styled from 'styled-components';
import { colors, fontSizes, media } from 'utils/styleUtils';
import { lighten } from 'polished';

// components
import { Icon } from 'cl2-component-library';

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

const DeleteButton = styled.button`
  display: flex;
  height: 20px;
  align-items: center;
  cursor: pointer;
  margin-left: 10px;

  &:hover {
    .cl-icon {
      fill: ${colors.clRed};
    }
  }
`;

const StyledIcon = styled(Icon)`
  width: 12px;
  fill: ${colors.label};
`;

interface Props {
  file:
    | IProjectFileData
    | IPhaseFileData
    | IPageFileData
    | IEventFileData
    | IIdeaFileData;
  onDeleteClick?: () => void;
  className?: string;
}

const FileDisplay = ({ file, onDeleteClick, className }: Props) => {
  if (!isNilOrError(file)) {
    return (
      <Container className={className}>
        <Paperclip name="paperclip" />
        <FileDownloadLink
          href={file.attributes.file.url}
          download={file.attributes.name}
          target="_blank"
          rel="noopener noreferrer"
        >
          {file.attributes.name}
        </FileDownloadLink>
        <Spacer />
        <FileSize>({returnFileSize(file.attributes.size)})</FileSize>
        {onDeleteClick && (
          <DeleteButton onClick={onDeleteClick}>
            <StyledIcon name="delete" />
          </DeleteButton>
        )}
      </Container>
    );
  }

  return null;
};

export default FileDisplay;

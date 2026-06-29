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
import { IIdeaFileData } from 'api/idea_files/types';
import { IPageFileData } from 'api/page_files/types';
import { IPhaseFileData } from 'api/phase_files/types';
import { IProjectFileData } from 'api/project_files/types';

import useLocalize from 'hooks/useLocalize';

import { useIntl } from 'utils/cl-intl';
import { getFileDisplayName, returnFileSize } from 'utils/fileUtils';
import { isNilOrError } from 'utils/helperUtils';

import messages from './messages';

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
  flex-shrink: 0;
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
  file:
    | IProjectFileData
    | IPhaseFileData
    | IPageFileData
    | IEventFileData
    | IIdeaFileData;
  className?: string;
}

const FileDisplay = ({ file, className }: Props) => {
  const { formatMessage } = useIntl();
  const localize = useLocalize();
  if (!isNilOrError(file)) {
    const {
      file: { url },
      name,
      size,
      title_multiloc,
    } = file.attributes;

    const title = title_multiloc ? localize(title_multiloc) : '';
    const displayName = getFileDisplayName(name, title);

    return (
      <Container className={className}>
        <Paperclip name="paperclip" />
        <FileDownloadLink
          href={url}
          download={name}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={formatMessage(messages.ariaLabel, {
            fileName: displayName,
            ...(size > 0 && { fileSize: returnFileSize(size) }),
          })}
        >
          {displayName}
        </FileDownloadLink>
        <Spacer />
        {size > 0 && <FileSize>({returnFileSize(size)})</FileSize>}
      </Container>
    );
  }

  return null;
};

export default FileDisplay;

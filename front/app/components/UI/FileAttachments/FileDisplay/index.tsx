import React from 'react';

import {
  colors,
  fontSizes,
  media,
  Icon,
} from '@citizenlab/cl2-component-library';
import { lighten } from 'polished';
import styled from 'styled-components';

import useLocale from 'hooks/useLocale';

import { returnFileSize } from 'utils/fileUtils';
import { isNilOrError } from 'utils/helperUtils';

import { IAttachedFileData } from '../types';

const Container = styled.div`
  display: flex;
  align-items: center;
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

const FileSize = styled.span`
  white-space: nowrap;
`;

interface Props {
  file: IAttachedFileData;
  className?: string;
}

const FileDisplay = ({ file, className }: Props) => {
  const locale = useLocale();
  if (!isNilOrError(file)) {
    const {
      file: { url },
      name,
      size,
    } = file.attributes;

    return (
      <Container className={className}>
        <Paperclip name="paperclip" />
        {/* The size is part of the link text (and visible on all screen
          sizes), so the link's accessible name is exactly what is on screen. */}
        <FileDownloadLink
          href={url}
          download={name}
          target="_blank"
          rel="noopener noreferrer"
        >
          {name}
          {size > 0 && (
            <>
              {' '}
              <FileSize>({returnFileSize(size, locale)})</FileSize>
            </>
          )}
        </FileDownloadLink>
      </Container>
    );
  }

  return null;
};

export default FileDisplay;

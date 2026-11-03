import React from 'react';

import { Badge, colors } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import useFileById from 'api/files/useFileById';

type Props = {
  fileId: string;
};

const StyledBadge = styled(Badge)`
  word-break: break-word;
`;

const FileItem = ({ fileId }: Props) => {
  const { data: file } = useFileById(fileId);

  const fileName = file?.data.attributes.name;

  if (!fileName) {
    return null;
  }

  return <StyledBadge color={colors.coolGrey600}>{fileName}</StyledBadge>;
};

export default FileItem;

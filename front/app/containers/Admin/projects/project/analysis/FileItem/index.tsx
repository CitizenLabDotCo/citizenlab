import React from 'react';

import { Badge, colors } from '@citizenlab/cl2-component-library';

import useFileById from 'api/files/useFileById';

type Props = {
  fileId: string;
};

const FileItem = ({ fileId }: Props) => {
  const { data: file } = useFileById(fileId);

  const fileName = file?.data.attributes.name;

  if (!fileName) {
    return null;
  }

  return <Badge color={colors.coolGrey600}>{fileName}</Badge>;
};

export default FileItem;

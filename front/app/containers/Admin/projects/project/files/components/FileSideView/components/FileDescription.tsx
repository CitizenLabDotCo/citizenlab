import React from 'react';

import { Box, Label, Text } from '@citizenlab/cl2-component-library';

import { IFile } from 'api/files/types';

import useLocalize from 'hooks/useLocalize';

import { useIntl } from 'utils/cl-intl';

import messages from '../../messages';

type Props = {
  file: IFile;
};

const FileDescription = ({ file }: Props) => {
  const localize = useLocalize();
  const { formatMessage } = useIntl();

  const title = localize(file.data.attributes.title_multiloc);
  const description = localize(file.data.attributes.description_multiloc);

  if (!title && !description) {
    return null;
  }

  return (
    <>
      {title && (
        <Box mb="16px">
          <Label>{formatMessage(messages.fileTitleLabel)}</Label>
          <Text>{title}</Text>
        </Box>
      )}
      {description && (
        <>
          <Label>{formatMessage(messages.description)}</Label>
          <Text>{description}</Text>
        </>
      )}
    </>
  );
};

export default FileDescription;

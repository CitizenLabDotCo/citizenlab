import React from 'react';

import { Label, Text } from '@citizenlab/cl2-component-library';

import { IFile } from 'api/files/types';

import useLocalize from 'hooks/useLocalize';

import { useIntl } from 'utils/cl-intl';

import messages from '../../messages';

type Props = {
  file: IFile;
};

const FileInfo = ({ file }: Props) => {
  const localize = useLocalize();
  const { formatMessage } = useIntl();

  return (
    <>
      <Label>{formatMessage(messages.description)}</Label>
      <Text>{localize(file.data.attributes.description_multiloc)}</Text>
    </>
  );
};

export default FileInfo;

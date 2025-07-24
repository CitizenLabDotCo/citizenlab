import React from 'react';

import { Label, Text } from '@citizenlab/cl2-component-library';

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

  const description = localize(file.data.attributes.description_multiloc);

  if (!description) {
    return null;
  }

  return (
    <>
      <Label>{formatMessage(messages.description)}</Label>
      <Text>{description}</Text>
    </>
  );
};

export default FileDescription;

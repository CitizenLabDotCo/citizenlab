import React from 'react';

import { Text } from '@citizenlab/cl2-component-library';
import { Multiloc } from 'typings';

import useLocalize from 'hooks/useLocalize';

import { useIntl } from 'utils/cl-intl';

import messages from '../messages';

export const DescriptionText = ({
  description,
  descriptionId,
}: {
  description: Multiloc | undefined;
  descriptionId?: string;
}) => {
  const localize = useLocalize();
  const { formatMessage } = useIntl();

  if (!description) return null;

  const localizedDescription = localize(description);

  return (
    <>
      {localizedDescription && (
        <Text color="grey700" fontSize="s" id={descriptionId}>
          {formatMessage(messages.description)} {localizedDescription}
        </Text>
      )}
    </>
  );
};

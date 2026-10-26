import React from 'react';

import {
  Box,
  Image,
  Text,
  bo,
  colors,
} from '@citizenlab/cl2-component-library';
import { Multiloc } from 'typings';

import useLocalize from 'hooks/useLocalize';

import volunteeringMessages from 'containers/Admin/projects/project/volunteering/messages';

import IconAction from 'components/UI/IconAction';

import { useIntl } from 'utils/cl-intl';

import messages from '../../messages';

const THUMBNAIL_SIZE = '40px';

interface Props {
  title: Multiloc;
  imageUrl: string | null | undefined;
  volunteersCount: number;
  onEdit: () => void;
  onDelete: () => void;
}

const CauseRow = ({
  title,
  imageUrl,
  volunteersCount,
  onEdit,
  onDelete,
}: Props) => {
  const { formatMessage } = useIntl();
  const localize = useLocalize();

  return (
    <Box
      as="li"
      display="flex"
      alignItems="center"
      gap="12px"
      py="8px"
      borderBottom={`1px solid ${colors.grey100}`}
    >
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt=""
          width={THUMBNAIL_SIZE}
          height={THUMBNAIL_SIZE}
          borderRadius={bo.borderRadius}
          objectFit="cover"
          style={{ flex: 'none' }}
        />
      ) : (
        <Box
          width={THUMBNAIL_SIZE}
          height={THUMBNAIL_SIZE}
          flex="none"
          borderRadius={bo.borderRadius}
          background={colors.grey100}
        />
      )}
      <Box display="flex" flexDirection="column" flexGrow={1} minWidth="0">
        <Text as="span" variant="boControl" m="0">
          {localize(title)}
        </Text>
        <Text as="span" variant="boHelper" fontSize="xs" m="0">
          {formatMessage(messages.nSignedUp, { count: volunteersCount })}
        </Text>
      </Box>
      <Box display="flex" gap="4px" flex="none">
        <IconAction
          icon="edit"
          tooltip={formatMessage(volunteeringMessages.editButtonLabel)}
          ariaLabel={formatMessage(volunteeringMessages.editCauseTitle)}
          onClick={onEdit}
        />
        <IconAction
          icon="delete"
          tooltip={formatMessage(volunteeringMessages.deleteButtonLabel)}
          ariaLabel={formatMessage(messages.deleteCause)}
          onClick={onDelete}
        />
      </Box>
    </Box>
  );
};

export default CauseRow;

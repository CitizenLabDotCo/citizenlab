import React from 'react';
import { Text, Box } from '@citizenlab/cl2-component-library';
import Avatar from 'components/Avatar';
import Button from 'components/UI/Button';
import { Row } from 'components/admin/ResourceList';
import { useIntl } from 'utils/cl-intl';
import messages from './messages';

interface Props {
  isLastItem: boolean;
  moderatorId: string;
  deleteButtonDisabled: boolean;
  displayName: string | JSX.Element;
  onDelete: () => void;
}

const ModeratorListRow = ({
  isLastItem,
  moderatorId,
  deleteButtonDisabled,
  displayName,
  onDelete,
}: Props) => {
  const { formatMessage } = useIntl();

  return (
    <Row key={moderatorId} isLastItem={isLastItem}>
      <Box display="flex" alignItems="center">
        <Box mr="12px">
          <Avatar userId={moderatorId} size={30} />
        </Box>
        <Text as="span" m={'0'}>
          {displayName}
        </Text>
      </Box>
      <Button
        onClick={onDelete}
        buttonStyle="text"
        icon="delete"
        disabled={deleteButtonDisabled}
      >
        {formatMessage(messages.deleteModeratorLabel)}
      </Button>
    </Row>
  );
};

export default ModeratorListRow;

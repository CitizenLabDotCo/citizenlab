import React from 'react';
import Tippy from '@tippyjs/react';

// components
import { Box } from '@citizenlab/cl2-component-library';
import Button from 'components/UI/Button';
import PrintReportButton from './PrintReportButton';

// i18n
import { useIntl } from 'utils/cl-intl';
import messages from '../messages';

interface Props {
  reportId: string;
  isLoading: boolean;
  canEdit?: boolean;
  onDelete: () => void;
  onEdit: () => void;
}

const Buttons = ({
  reportId,
  isLoading,
  canEdit = true,
  onDelete,
  onEdit,
}: Props) => {
  const { formatMessage } = useIntl();

  return (
    <Box display="flex">
      <Button
        mr="8px"
        icon="delete"
        buttonStyle="white"
        onClick={onDelete}
        processing={isLoading}
        disabled={isLoading || !canEdit}
        iconSize="18px"
      >
        {formatMessage(messages.delete)}
      </Button>
      <Tippy
        disabled={canEdit}
        interactive={true}
        placement="bottom"
        content={formatMessage(messages.cannotEditReport)}
      >
        <div>
          <Button
            mr="8px"
            icon="edit"
            buttonStyle="secondary"
            onClick={onEdit}
            disabled={isLoading || !canEdit}
            iconSize="18px"
          >
            {formatMessage(messages.edit)}
          </Button>
        </div>
      </Tippy>
      <PrintReportButton reportId={reportId} />
    </Box>
  );
};

export default Buttons;

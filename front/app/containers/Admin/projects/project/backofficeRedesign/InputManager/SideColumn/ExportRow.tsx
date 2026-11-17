import React from 'react';

import { ManagerType } from 'components/admin/PostManager';
import ExportButtons from 'components/admin/PostManager/components/ExportMenu/ExportButtons';

import Button from 'design-system/Button';
import Popover, { DialogTrigger } from 'design-system/Popover';

import { useIntl } from 'utils/cl-intl';

import messages from '../messages';

interface Props {
  type: ManagerType;
  projectId: string;
  selectedIds: string[];
}

const ExportRow = ({ type, projectId, selectedIds }: Props) => {
  const { formatMessage } = useIntl();
  const hasSelection = selectedIds.length > 0;

  return (
    <DialogTrigger>
      <Button trailingIcon="download-16">
        {formatMessage(messages.export)}
      </Button>
      <Popover aria-label={formatMessage(messages.exportParticipationData)}>
        {/* Kept from the menu this replaced; the e2e tests find the export options by it. */}
        <div role="menu">
          <ExportButtons
            type={type}
            exportType={hasSelection ? 'selected_posts' : 'project'}
            exportQueryParameter={hasSelection ? selectedIds : projectId}
          />
        </div>
      </Popover>
    </DialogTrigger>
  );
};

export default ExportRow;

import React from 'react';

import { ManagerType } from 'components/admin/PostManager';
import ExportButtons from 'components/admin/PostManager/components/ExportMenu/ExportButtons';

import { useIntl } from 'utils/cl-intl';

import messages from '../messages';

import Card from './Card';

interface Props {
  type: ManagerType;
  projectId: string;
  /** Exports only these inputs when some are selected. */
  selectedIds: string[];
}

const ExportsCard = ({ type, projectId, selectedIds }: Props) => {
  const { formatMessage } = useIntl();
  const hasSelection = selectedIds.length > 0;

  return (
    <Card title={formatMessage(messages.exports)}>
      <ExportButtons
        type={type}
        exportType={hasSelection ? 'selected_posts' : 'project'}
        exportQueryParameter={hasSelection ? selectedIds : projectId}
      />
    </Card>
  );
};

export default ExportsCard;

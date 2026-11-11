import React from 'react';

import { Box, Button } from '@citizenlab/cl2-component-library';

import { ManagerType } from 'components/admin/PostManager';
import ExportButtons from 'components/admin/PostManager/components/ExportMenu/ExportButtons';

import { useIntl } from 'utils/cl-intl';

import MenuButton from '../MenuButton';
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
    <MenuButton
      portal
      width="340px"
      triggerWidth="100%"
      trigger={({ opened, toggle }) => (
        <Button
          buttonStyle="bo-secondary"
          width="100%"
          height="44px"
          justify="space-between"
          icon="download"
          iconPos="right"
          title={formatMessage(messages.exportParticipationData)}
          ariaExpanded={opened}
          onClick={toggle}
        >
          {formatMessage(messages.export)}
        </Button>
      )}
    >
      {() => (
        <Box role="menu">
          <ExportButtons
            type={type}
            exportType={hasSelection ? 'selected_posts' : 'project'}
            exportQueryParameter={hasSelection ? selectedIds : projectId}
          />
        </Box>
      )}
    </MenuButton>
  );
};

export default ExportRow;

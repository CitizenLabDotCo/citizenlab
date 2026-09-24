import React, { useState } from 'react';

import {
  Box,
  Button,
  Dropdown,
  fontSizes,
} from '@citizenlab/cl2-component-library';

import ExportButtons from 'components/admin/PostManager/components/ExportMenu/ExportButtons';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';

interface Props {
  projectId: string;
  selection: Set<string>;
}

const ExportDropdown = ({ projectId, selection }: Props) => {
  const { formatMessage } = useIntl();
  const [opened, setOpened] = useState(false);
  const hasSelection = selection.size > 0;

  return (
    <Box position="relative" flex="1 1 0">
      <Button
        buttonStyle="secondary-outlined"
        padding="6px 12px"
        fontSize={`${fontSizes.s}px`}
        iconSize="16px"
        width="100%"
        icon="upload-file"
        onClick={() => setOpened((opened) => !opened)}
      >
        {formatMessage(messages.export)}
      </Button>
      <Dropdown
        opened={opened}
        onClickOutside={() => setOpened(false)}
        top="40px"
        right="0px"
        width="260px"
        content={
          <ExportButtons
            type="ProjectIdeas"
            exportType={hasSelection ? 'selected_posts' : 'project'}
            exportQueryParameter={hasSelection ? [...selection] : projectId}
          />
        }
      />
    </Box>
  );
};

export default ExportDropdown;

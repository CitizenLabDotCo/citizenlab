import React, { useState } from 'react';

import { Box, Button } from '@citizenlab/cl2-component-library';

import { ManagerType } from 'components/admin/PostManager';
import ExportButtons from 'components/admin/PostManager/components/ExportMenu/ExportButtons';

import { useIntl } from 'utils/cl-intl';

import messages from '../messages';

import { actionRowProps } from './actionRowProps';

interface Props {
  type: ManagerType;
  projectId: string;
  selectedIds: string[];
}

// Stable, so it only runs when the options open and not on every render.
const scrollIntoColumn = (options: HTMLDivElement | null) => {
  const reduceMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;

  options?.scrollIntoView({
    behavior: reduceMotion ? 'auto' : 'smooth',
    block: 'nearest',
  });
};

// The options open in place because the narrow column would clip a dropdown.
const ExportRow = ({ type, projectId, selectedIds }: Props) => {
  const { formatMessage } = useIntl();
  const [opened, setOpened] = useState(false);
  const hasSelection = selectedIds.length > 0;

  return (
    <>
      <Button
        {...actionRowProps}
        icon="download"
        ariaExpanded={opened}
        onClick={() => setOpened(!opened)}
      >
        {formatMessage(messages.export)}
      </Button>
      {opened && (
        <Box ref={scrollIntoColumn}>
          <ExportButtons
            type={type}
            exportType={hasSelection ? 'selected_posts' : 'project'}
            exportQueryParameter={hasSelection ? selectedIds : projectId}
          />
        </Box>
      )}
    </>
  );
};

export default ExportRow;

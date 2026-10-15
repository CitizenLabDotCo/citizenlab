import React, { useRef } from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import { useIntl } from 'utils/cl-intl';

import allMessages from '../messages';
import { NewProjectMode } from '../NewProjectModal';

import MenuRow from './Menu/MenuRow';

interface Props {
  label: string;
  takeFocus: boolean;
  onPick: (mode: NewProjectMode) => void;
}

// The two ways to start a project, beside New's Project row. The project
// button's own menu (NewProjectButton, for those who can only create projects)
// offers the same two, in its own rows: this flyout keeps the dense rows of the
// menu it opens from. Whether New needs this flyout at all is a question for
// the design.
const NewProjectFlyout = ({ label, takeFocus, onPick }: Props) => {
  const { formatMessage } = useIntl();

  const focused = useRef(false);
  const focusFirst = (node: HTMLDivElement | null) => {
    const first = node?.querySelector('button');
    if (takeFocus && first && !focused.current) {
      focused.current = true;
      first.focus();
    }
  };

  return (
    <Box ref={focusFirst} role="menu" aria-label={label}>
      <MenuRow
        icon="page"
        label={formatMessage(allMessages.fromScratchMenuItem)}
        onClick={() => onPick('scratch')}
      />
      <MenuRow
        icon="grid"
        label={formatMessage(allMessages.useTemplateMenuItem)}
        onClick={() => onPick('template')}
      />
    </Box>
  );
};

export default NewProjectFlyout;

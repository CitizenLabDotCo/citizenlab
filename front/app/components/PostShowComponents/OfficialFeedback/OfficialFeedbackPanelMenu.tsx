import React from 'react';

import IconButton from 'design-system/IconButton';
import Menu, { MenuItem, MenuTrigger } from 'design-system/Menu';

import moreActionsMessages from 'components/UI/MoreActionsMenu/messages';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';

interface Props {
  onEdit: () => void;
  onDelete: () => void;
}

const OfficialFeedbackPanelMenu = ({ onEdit, onDelete }: Props) => {
  const { formatMessage } = useIntl();

  return (
    <MenuTrigger>
      <IconButton
        icon="more-horizontal-16"
        aria-label={formatMessage(moreActionsMessages.showMoreActions)}
      />
      <Menu
        aria-label={formatMessage(moreActionsMessages.showMoreActions)}
        placement="bottom end"
      >
        <MenuItem id="edit" onAction={onEdit}>
          {formatMessage(messages.editOfficialFeedbackPost)}
        </MenuItem>
        <MenuItem id="delete" variant="danger" onAction={onDelete}>
          {formatMessage(messages.deleteOfficialFeedbackPost)}
        </MenuItem>
      </Menu>
    </MenuTrigger>
  );
};

export default OfficialFeedbackPanelMenu;

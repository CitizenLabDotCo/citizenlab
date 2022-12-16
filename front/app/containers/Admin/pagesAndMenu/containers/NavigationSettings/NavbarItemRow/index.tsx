import React from 'react';

// styling
import styled from 'styled-components';
import { colors } from 'utils/styleUtils';
import { Box } from '@citizenlab/cl2-component-library';

// components
import { TextCell } from 'components/admin/ResourceList';
import Link from 'utils/cl-router/Link';
import Button from 'components/UI/Button';
import T from 'components/T';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// typings
import { Multiloc } from 'typings';

const Container = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  height: 50px;
  align-items: center;
  justify-content: space-between;
`;

const DefaultTag = styled.div`
  display: inline-block;
  color: ${colors.textSecondary};
  background-color: ${colors.grey200};
  font-weight: bold;
  font-size: 12px;
  padding: 0px 6px;
  margin-left: 15px;
  transform: translateY(-2px);
  border-radius: 3px;
  text-transform: uppercase;
`;

interface Props {
  title: Multiloc;
  isDefaultPage?: boolean;
  showEditButton?: boolean;
  showAddButton?: boolean;
  addButtonDisabled?: boolean;
  showRemoveButton?: boolean;
  showViewButton?: boolean;
  viewButtonLink?: string;
  onClickEditButton?: () => void;
  onClickAddButton?: () => void;
  onClickRemoveButton?: () => void;
  onClickDeleteButton?: () => void;
}

const NavbarItemRow = ({
  title,
  isDefaultPage,
  showEditButton,
  showAddButton,
  addButtonDisabled,
  showRemoveButton,
  viewButtonLink,
  onClickEditButton,
  onClickAddButton,
  onClickRemoveButton,
  onClickDeleteButton,
}: Props) => {
  const handleOnClickEditButton = () => {
    onClickEditButton?.();
  };

  const handleOnClickAddButton = () => {
    if (!addButtonDisabled) {
      onClickAddButton?.();
    }
  };

  const handleOnClickRemoveButton = () => {
    onClickRemoveButton?.();
  };

  const handleOnClickDeleteButton = () => {
    onClickDeleteButton?.();
  };

  return (
    <Container data-testid="navbar-item-row">
      <TextCell className="expand">
        <T value={title} />

        {isDefaultPage && (
          <DefaultTag data-testid="default-tag">
            <FormattedMessage {...messages.defaultTag} />
          </DefaultTag>
        )}
      </TextCell>

      <Box display="flex" alignItems="flex-end">
        {showEditButton && (
          <Button
            buttonStyle="secondary"
            icon="edit"
            onClick={handleOnClickEditButton}
            ml="10px"
            data-testid="edit-button"
            data-cy="e2e-navbar-item-edit-button"
            className="intercom-admin-pages-menu-edit-button"
          >
            <FormattedMessage {...messages.editButton} />
          </Button>
        )}

        {viewButtonLink && (
          <Link to={viewButtonLink} target="_blank">
            <Button
              buttonStyle="secondary"
              icon="eye"
              ml="10px"
              className="intercom-admin-pages-menu-view-button"
            >
              <FormattedMessage {...messages.viewButton} />
            </Button>
          </Link>
        )}

        {!isDefaultPage && onClickDeleteButton && (
          <Button
            buttonStyle="secondary"
            icon="delete"
            onClick={handleOnClickDeleteButton}
            ml="10px"
            className="intercom-admin-pages-menu-delete-button"
          >
            <FormattedMessage {...messages.deleteButton} />
          </Button>
        )}

        {showAddButton && (
          <Button
            // no icon on add and remove buttons, so specify height to match the others
            height="44px"
            buttonStyle="secondary"
            onClick={handleOnClickAddButton}
            disabled={addButtonDisabled}
            ml="10px"
            className="intercom-admin-pages-menu-add-to-navbar-button"
          >
            <FormattedMessage {...messages.addButton} />
          </Button>
        )}

        {showRemoveButton && (
          <Button
            height="44px"
            buttonStyle="secondary"
            onClick={handleOnClickRemoveButton}
            ml="10px"
            className="intercom-admin-pages-menu-remove-from-navbar-button"
          >
            <FormattedMessage {...messages.removeButton} />
          </Button>
        )}
      </Box>
    </Container>
  );
};

export default NavbarItemRow;

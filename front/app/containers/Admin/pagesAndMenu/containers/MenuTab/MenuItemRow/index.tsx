import React from 'react';

import { Box, colors, IconButton } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';
import { Multiloc } from 'typings';

import { TextCell } from 'components/admin/ResourceList';
import T from 'components/T';
import ButtonWithLink from 'components/UI/ButtonWithLink';

import { FormattedMessage, useIntl } from 'utils/cl-intl';
import Link from 'utils/cl-router/Link';

import messages from './messages';

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
  viewButtonLink?: string;
  onClickEditButton: () => void;
  showRemoveButton?: boolean;
  onClickRemoveButton?: () => void;
}

const MenuItemRow = ({
  title,
  isDefaultPage,
  viewButtonLink,
  onClickEditButton,
  showRemoveButton,
  onClickRemoveButton,
}: Props) => {
  const { formatMessage } = useIntl();

  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="space-between"
      width="100%"
      data-testid="menu-item-row"
    >
      <TextCell className="expand">
        <T value={title} />
        {isDefaultPage && (
          <DefaultTag data-testid="default-tag">
            <FormattedMessage {...messages.defaultTag} />
          </DefaultTag>
        )}
      </TextCell>

      <Box display="flex" alignItems="center" gap="12px">
        <IconButton
          iconName="edit"
          onClick={onClickEditButton}
          a11y_buttonActionMessage={formatMessage(messages.editItem)}
          iconColor={colors.textSecondary}
          iconColorOnHover={colors.primary}
          iconWidth="20px"
          iconHeight="20px"
          className="intercom-admin-pages-menu-edit-button"
        />

        {viewButtonLink && (
          <Link to={viewButtonLink} target="_blank">
            <IconButton
              iconName="eye"
              onClick={() => {}}
              a11y_buttonActionMessage={formatMessage(messages.viewItem)}
              iconColor={colors.textSecondary}
              iconColorOnHover={colors.primary}
              iconWidth="20px"
              iconHeight="20px"
              className="intercom-admin-pages-menu-view-button"
            />
          </Link>
        )}

        {showRemoveButton && (
          <ButtonWithLink
            buttonStyle="text"
            padding="0px"
            onClick={onClickRemoveButton}
            className="intercom-admin-pages-menu-remove-from-navbar-button"
          >
            <FormattedMessage {...messages.removeFromNavbar} />
          </ButtonWithLink>
        )}
      </Box>
    </Box>
  );
};

export default MenuItemRow;

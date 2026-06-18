import React, { useState } from 'react';

import { Box, colors, IconButton } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';
import { Multiloc } from 'typings';

import { INavbarChild } from 'api/navbar/types';

import { TextCell } from 'components/admin/ResourceList';
import T from 'components/T';
import ButtonWithLink from 'components/UI/ButtonWithLink';

import { FormattedMessage, useIntl } from 'utils/cl-intl';
import Link from 'utils/cl-router/Link';

import messages from './messages';

const Tag = styled.div`
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

const ChildItem = styled.div`
  color: ${colors.textSecondary};
  font-size: 14px;
  padding: 10px 0;

  & + & {
    border-top: 1px solid ${colors.divider};
  }
`;

interface Props {
  title: Multiloc;
  isDefaultPage?: boolean;
  isDropdown?: boolean;
  dropdownChildren?: INavbarChild[];
  viewButtonLink?: string;
  onClickEditButton: () => void;
  showRemoveButton?: boolean;
  onClickRemoveButton?: () => void;
}

const MenuItemRow = ({
  title,
  isDefaultPage,
  isDropdown,
  dropdownChildren,
  viewButtonLink,
  onClickEditButton,
  showRemoveButton,
  onClickRemoveButton,
}: Props) => {
  const { formatMessage } = useIntl();
  const [expanded, setExpanded] = useState(false);

  return (
    <Box display="flex" flexDirection="column" width="100%">
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        width="100%"
        data-testid="menu-item-row"
      >
        <TextCell className="expand">
          <Box display="flex" alignItems="center">
            <T value={title} />
            {isDefaultPage && (
              <Tag data-testid="default-tag">
                <FormattedMessage {...messages.defaultTag} />
              </Tag>
            )}
            {isDropdown && (
              <>
                <Tag data-testid="dropdown-tag">
                  <FormattedMessage {...messages.dropdownTag} />
                </Tag>
                <Box ml="4px">
                  <IconButton
                    iconName={expanded ? 'chevron-up' : 'chevron-down'}
                    onClick={() => setExpanded((value) => !value)}
                    a11y_buttonActionMessage={formatMessage(
                      expanded
                        ? messages.collapseDropdown
                        : messages.expandDropdown
                    )}
                    iconColor={colors.textSecondary}
                    iconColorOnHover={colors.primary}
                    iconWidth="16px"
                    iconHeight="16px"
                  />
                </Box>
              </>
            )}
          </Box>
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

      {isDropdown && expanded && dropdownChildren && (
        <Box pl="16px" mt="4px">
          {dropdownChildren.map((child) => (
            <ChildItem key={child.id}>
              <T value={child.title_multiloc} />
            </ChildItem>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default MenuItemRow;

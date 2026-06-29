import React, { useState } from 'react';

import {
  Box,
  Button,
  colors,
  IconButton,
  Badge,
  stylingConsts,
} from '@citizenlab/cl2-component-library';
import styled from 'styled-components';
import { Multiloc } from 'typings';

import { INavbarChild } from 'api/navbar/types';

import { TextCell } from 'components/admin/ResourceList';
import T from 'components/T';

import { FormattedMessage, useIntl } from 'utils/cl-intl';
import Link from 'utils/cl-router/Link';

import messages from './messages';

const ChildItem = styled.div`
  color: ${colors.textSecondary};
  padding: 10px 0;

  & + & {
    border-top: 1px solid ${colors.grey100};
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
          <Box display="flex" alignItems="center" gap="8px">
            <T value={title} />
            {isDefaultPage && (
              <Badge data-testid="default-tag" className="inverse">
                <FormattedMessage {...messages.defaultTag} />
              </Badge>
            )}
            {isDropdown && (
              <>
                <Badge data-testid="dropdown-tag" className="inverse">
                  <FormattedMessage {...messages.dropdownTag} />
                </Badge>
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
                    p="4px"
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
            p="4px"
            border={`1px solid ${colors.borderLight}`}
            borderRadius={stylingConsts.borderRadius}
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
                p="4px"
                border={`1px solid ${colors.borderLight}`}
                borderRadius={stylingConsts.borderRadius}
                className="intercom-admin-pages-menu-view-button"
              />
            </Link>
          )}

          {showRemoveButton && (
            <Button
              buttonStyle="text"
              padding="0px"
              onClick={onClickRemoveButton}
              className="intercom-admin-pages-menu-remove-from-navbar-button"
            >
              <FormattedMessage {...messages.removeFromNavbar} />
            </Button>
          )}
        </Box>
      </Box>

      {isDropdown && expanded && dropdownChildren && (
        <Box mt="8px">
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

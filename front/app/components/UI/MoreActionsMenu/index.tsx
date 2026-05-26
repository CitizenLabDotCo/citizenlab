import React, { useState, forwardRef } from 'react';

import {
  Box,
  Dropdown,
  DropdownListItem,
  Icon,
  IconNames,
  Spinner,
  Text,
  colors,
  fontSizes,
  media,
} from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import { FormattedMessage, useIntl } from 'utils/cl-intl';
import { removeFocusAfterMouseClick } from 'utils/helperUtils';

import messages from './messages';

const Container = styled.div`
  position: relative;
  display: inline-block;
`;

const MoreOptionsIcon = styled(Icon)<{ color?: string }>`
  fill: ${({ color }) => color || colors.textSecondary};
  transition: all 100ms ease-out;
`;

const MoreOptionsLabel = styled.div`
  color: ${colors.textSecondary};
  font-size: ${fontSizes.s}px;
  line-height: normal;
  font-weight: 400;
  white-space: nowrap;
  margin-left: 10px;
  transition: all 100ms ease-out;

  ${media.tablet`
    display: none;
  `}
`;

const MoreOptionsButton = styled.button`
  min-width: 25px;
  min-height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  margin: 0;
  border: none;
  background: transparent;
  cursor: pointer;

  &:hover,
  &:focus {
    ${MoreOptionsIcon} {
      fill: #000;
    }

    ${MoreOptionsLabel} {
      color: #000;
    }
  }
`;

const StyledSpinner = styled(Spinner)`
  margin-right: 8px;
  width: 20px;
`;

export interface IAction {
  label: string | JSX.Element;
  handler: (event: React.MouseEvent) => void;
  icon?: IconNames;
  name?: string;
  isLoading?: boolean;
}

export interface Props {
  actions: IAction[];
  // required for a11y
  labelAndTitle?: string | JSX.Element;
  showLabel?: boolean;
  className?: string;
  color?: string;
  id?: string;
  'data-cy'?: string;
  onClick?: (event: React.MouseEvent) => void;
  ideaTitle?: string;
}

const MoreActionsMenu = forwardRef<HTMLButtonElement, Props>(
  (props, moreActionsButtonRef) => {
    const {
      actions,
      showLabel = true,
      color,
      labelAndTitle = <FormattedMessage {...messages.showMoreActions} />,
      className,
      id,
      onClick,
      ideaTitle,
    } = props;
    const { formatMessage } = useIntl();
    const [visible, setVisible] = useState(false);

    // Generate a unique ID for aria-labelledby
    const labelId = `more-options-label-${Math.random()
      .toString(36)
      .slice(2, 11)}`;

    const hide = () => {
      setVisible(false);
    };

    const toggleMenu = (event: React.MouseEvent) => {
      onClick && onClick(event);
      event.preventDefault();
      event.stopPropagation();
      setVisible((current) => !current);
    };

    const handleListItemOnClick =
      (handler: (event: React.MouseEvent) => Promise<any> | void) =>
      async (event: React.MouseEvent) => {
        event.preventDefault();
        event.stopPropagation();
        await handler(event);
        hide();
      };

    if (actions.length === 0) {
      return <Box width="25px" />; // to keep other elements in the row in the same place as when there is actions menu
    }

    return (
      <Container className={className || ''}>
        <MoreOptionsButton
          ref={moreActionsButtonRef}
          onMouseDown={removeFocusAfterMouseClick}
          onClick={toggleMenu}
          aria-expanded={visible}
          id={id}
          data-cy={props['data-cy']}
          className="e2e-more-actions"
          data-testid="moreOptionsButton"
          aria-labelledby={showLabel ? labelId : undefined}
          aria-label={formatMessage(messages.actionsMenu, {
            title: ideaTitle || '',
          })}
        >
          <MoreOptionsIcon name="dots-horizontal" color={color} />
          {showLabel && (
            <MoreOptionsLabel id={labelId}>{labelAndTitle}</MoreOptionsLabel>
          )}
        </MoreOptionsButton>
        <Dropdown
          opened={visible}
          onClickOutside={hide}
          className="e2e-more-actions-list"
          right="0px"
          content={
            <Box role="menu">
              {actions.map((action, index) => {
                const { handler, label, icon, name, isLoading } = action;

                return (
                  <DropdownListItem
                    key={index}
                    onMouseDown={removeFocusAfterMouseClick}
                    onClick={handleListItemOnClick(handler)}
                    className={name ? `e2e-action-${name}` : undefined}
                    role="menuitem"
                  >
                    <Text textAlign="left" m="0px">
                      <Box display="flex" gap="8px" alignItems="center">
                        {isLoading ? (
                          <StyledSpinner size="20px" />
                        ) : (
                          icon && <Icon name={icon} />
                        )}
                        {label}
                      </Box>
                    </Text>
                  </DropdownListItem>
                );
              })}
            </Box>
          }
        />
      </Container>
    );
  }
);

export default MoreActionsMenu;

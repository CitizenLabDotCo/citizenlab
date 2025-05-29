import React, { useState, forwardRef } from 'react';

import {
  Box,
  Icon,
  IconNames,
  Spinner,
  colors,
  fontSizes,
  media,
  Tooltip,
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

const List = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  margin-top: 3px;
  margin-bottom: 3px;
`;

const ListItem = styled.button`
  flex: 1 1 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: ${colors.white};
  font-size: ${fontSizes.s}px;
  font-weight: 400;
  white-space: nowrap;
  padding: 10px;
  border-radius: ${(props) => props.theme.borderRadius};
  cursor: pointer;
  white-space: nowrap;
  transition: all 100ms ease-out;

  & > span {
    margin-right: 5px;
  }

  &:hover,
  &:focus {
    color: white;
    background: ${colors.grey700};
  }
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
      setVisible((current) => !current);
    };

    const handleListItemOnClick =
      (handler: (event: React.MouseEvent) => Promise<any> | void) =>
      async (event: React.MouseEvent) => {
        event.preventDefault();
        await handler(event);
        hide();
      };

    if (actions.length === 0) {
      return <Box width="25px" />; // to keep other elements in the row in the same place as when there is actions menu
    }

    return (
      <Container className={className || ''}>
        <Tooltip
          placement="bottom"
          duration={[200, 0]}
          visible={visible}
          onClickOutside={hide}
          theme="dark"
          content={
            <List className="e2e-more-actions-list">
              {actions.map((action, index) => {
                const { handler, label, icon, name, isLoading } = action;

                return (
                  <ListItem
                    key={index}
                    onMouseDown={removeFocusAfterMouseClick}
                    onClick={handleListItemOnClick(handler)}
                    className={name ? `e2e-action-${name}` : undefined}
                  >
                    {label}
                    {icon && !isLoading && (
                      <Box
                        width="20px"
                        height="20px"
                        display="flex"
                        alignItems="center"
                        ml="12px"
                      >
                        <Icon name={icon} fill="white" />
                      </Box>
                    )}
                    {isLoading && (
                      <Box ml="12px">
                        <Spinner color="white" size="20px" />
                      </Box>
                    )}
                  </ListItem>
                );
              })}
            </List>
          }
          useContentWrapper={false}
        >
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
            aria-label={
              !showLabel ? formatMessage(messages.moreOptions) : undefined
            }
          >
            <MoreOptionsIcon name="dots-horizontal" color={color} />
            {showLabel && (
              <MoreOptionsLabel id={labelId}>{labelAndTitle}</MoreOptionsLabel>
            )}
          </MoreOptionsButton>
        </Tooltip>
      </Container>
    );
  }
);

export default MoreActionsMenu;

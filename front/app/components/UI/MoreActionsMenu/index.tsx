// Libraries
import React, { useState } from 'react';
import { removeFocusAfterMouseClick } from 'utils/helperUtils';

// Components
import {
  Box,
  Icon,
  IconNames,
  Spinner,
} from '@citizenlab/cl2-component-library';
import Tippy from '@tippyjs/react';

// Styling
import styled from 'styled-components';
import { colors, fontSizes, media } from 'utils/styleUtils';
import messages from './messages';

import { FormattedMessage } from 'utils/cl-intl';

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
  handler: () => void;
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
}

const MoreActionsMenu = (props: Props) => {
  const [visible, setVisible] = useState(false);

  const hide = () => {
    setVisible(false);
  };

  const toggleMenu = (event: React.MouseEvent) => {
    event.preventDefault();
    setVisible((current) => !current);
  };

  const handleListItemOnClick =
    (handler: () => Promise<any> | void) => async (event: React.MouseEvent) => {
      event.preventDefault();
      await handler();
      hide();
    };

  const {
    actions,
    showLabel = true,
    color,
    labelAndTitle = <FormattedMessage {...messages.showMoreActions} />,
    className,
    id,
  } = props;

  if (actions.length === 0) {
    return <Box width="25px" />; // to keep other elements in the row in the same place as when there is actions menu
  }

  return (
    <Container className={className || ''}>
      <Tippy
        placement="bottom"
        interactive={true}
        duration={[200, 0]}
        visible={visible}
        onClickOutside={hide}
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
      >
        <MoreOptionsButton
          onMouseDown={removeFocusAfterMouseClick}
          onClick={toggleMenu}
          aria-expanded={visible}
          id={id}
          className="e2e-more-actions"
          data-testid="moreOptionsButton"
        >
          <MoreOptionsIcon
            title={labelAndTitle}
            name="dots-horizontal"
            color={color}
            ariaHidden={!showLabel}
          />
          {showLabel && <MoreOptionsLabel>{labelAndTitle}</MoreOptionsLabel>}
        </MoreOptionsButton>
      </Tippy>
    </Container>
  );
};

export default MoreActionsMenu;

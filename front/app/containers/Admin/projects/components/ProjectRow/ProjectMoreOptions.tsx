import Tippy from '@tippyjs/react';
import React, { ReactNode } from 'react';
import styled from 'styled-components';
import { colors, fontSizes } from 'utils/styleUtils';
import { lighten } from 'polished';
import { FormattedMessage, MessageDescriptor } from 'utils/cl-intl';
import { Icon, IconNames } from '@citizenlab/cl2-component-library';
import { removeFocusAfterMouseClick } from 'utils/helperUtils';

const MoreOptionsWrapper = styled.div`
  width: 20px;
  position: relative;
  display: flex;
  align-items: center;
`;

const MoreOptionsIcon = styled(Icon)`
  fill: ${colors.textSecondary};
`;

const DropdownList = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  margin-top: 5px;
  margin-bottom: 5px;
`;

const DropdownListButton = styled.button`
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

  &:hover,
  &:focus {
    outline: none;
    color: white;
    background: ${lighten(0.1, colors.grey800)};
  }
`;

const IconWrapper = styled.div`
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 10px;

  .cl-icon {
    height: 100%;
  }

  .cl-icon-primary,
  .cl-icon-secondary,
  .cl-icon-accent {
    fill: currentColor;
  }
`;

const MoreOptionsButton = styled.button`
  width: 25px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  margin: 0;
  border: none;
  background: transparent;
  cursor: pointer;

  &:hover ${MoreOptionsIcon} {
    fill: #000;
  }
`;

interface Props {
  onClick: () => void;
  message: MessageDescriptor;
  iconName: IconNames;
}

export const ProjectMoreOptionsOption = ({
  onClick,
  message,
  iconName,
}: Props) => {
  return (
    <DropdownListButton onClick={onClick}>
      <FormattedMessage {...message} />
      <IconWrapper>
        <Icon name={iconName} fill="white" />
      </IconWrapper>
    </DropdownListButton>
  );
};

interface PProps {
  children: ReactNode;
}
const ProjectMoreOptions = ({ children }: PProps) => {
  return (
    <MoreOptionsWrapper>
      <Tippy
        placement="bottom-end"
        interactive={true}
        trigger="click"
        duration={[200, 0]}
        content={<DropdownList>{children}</DropdownList>}
      >
        <MoreOptionsButton onMouseDown={removeFocusAfterMouseClick}>
          <MoreOptionsIcon name="dots-horizontal" />
        </MoreOptionsButton>
      </Tippy>
    </MoreOptionsWrapper>
  );
};

export default ProjectMoreOptions;

import React from 'react';
import bowser from 'bowser';

// components
import { Dropdown } from 'cl2-component-library';

// styling
import styled from 'styled-components';

const Container = styled.div`
  height: 100%;
  position: relative;
  display: flex;
  flex-direction: column;
`;

const DropdownWrapper = styled.div`
  width: 100%;
  flex: 0 0 0px;
  position: relative;
  display: flex;
  justify-content: center;
`;

interface Props {
  className?: string;
  buttonComponent: JSX.Element;
  dropdownContent: JSX.Element;
  dropdownOpened: boolean;
  onClickOutside: () => void;
  dropdownWidth?: string;
}

const ButtonWithDropdown = ({ className, buttonComponent, dropdownContent, dropdownOpened, onClickOutside, dropdownWidth }: Props) => {
  // TODO: add aria-expanded to buttonComponent
  return (
    <Container className={className}>
      {buttonComponent}
      <DropdownWrapper>
        <Dropdown
          top="5px"
          right={bowser.msie ? '-5px' : 'auto'}
          opened={dropdownOpened}
          onClickOutside={onClickOutside}
          content={dropdownContent}
          width={dropdownWidth}
        />
      </DropdownWrapper>
    </Container>
  );
}

export default ButtonWithDropdown;

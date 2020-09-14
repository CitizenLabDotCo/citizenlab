import React, { useRef, useState, useEffect, cloneElement } from 'react';
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
}

const ButtonWithDropdown = ({
  className,
  buttonComponent,
  dropdownContent,
}: Props) => {
  const [buttonWidth, setButtonWidth] = useState(0);
  const ref = useRef<HTMLDivElement | null>(null);
  const [dropdownOpened, setDropdownOpened] = useState(false);

  const toggleDropdown = () => {
    setDropdownOpened(!dropdownOpened);
  };

  useEffect(() => {
    if (ref.current) {
      setButtonWidth(ref.current.offsetWidth);
    }
  });

  const button = cloneElement(buttonComponent, { onClick: toggleDropdown });

  // TODO: add aria-expanded to buttonComponent
  return (
    <Container className={className}>
      <div ref={ref}>{button}</div>
      <DropdownWrapper>
        <Dropdown
          top="5px"
          right={bowser.msie ? '-5px' : 'auto'}
          opened={dropdownOpened}
          onClickOutside={toggleDropdown}
          content={dropdownContent}
          width={`${buttonWidth}px`}
        />
      </DropdownWrapper>
    </Container>
  );
};

export default ButtonWithDropdown;

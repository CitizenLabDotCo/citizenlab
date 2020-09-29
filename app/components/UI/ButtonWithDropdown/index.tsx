import React, { useRef, useState, useEffect, cloneElement } from 'react';
import bowser from 'bowser';
import { trackEventByName } from 'utils/analytics';

// components
import { Dropdown } from 'cl2-component-library';

// styling
import styled from 'styled-components';

const Container = styled.div`
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
  trackName?: string;
}

const ButtonWithDropdown = ({
  className,
  buttonComponent,
  dropdownContent,
  trackName,
}: Props) => {
  const [buttonWidth, setButtonWidth] = useState(0);
  const ref = useRef<HTMLDivElement | null>(null);
  const [dropdownOpened, setDropdownOpened] = useState(false);

  const onClick = () => {
    toggleDropdown();
    trackName && trackClick(trackName);
  };

  const toggleDropdown = () => {
    setDropdownOpened(!dropdownOpened);
  };

  const trackClick = (trackName: string) => {
    trackEventByName(trackName);
  };

  useEffect(() => {
    if (ref.current) {
      setButtonWidth(ref.current.offsetWidth);
    }
  });

  const button = cloneElement(buttonComponent, {
    onClick,
    ariaExpanded: dropdownOpened,
  });

  return (
    <Container className={className}>
      <div ref={ref}>{button}</div>
      <DropdownWrapper>
        <Dropdown
          top="5px"
          left="0px"
          mobileLeft="0px"
          right={bowser.msie ? '-5px' : 'auto'}
          opened={dropdownOpened}
          onClickOutside={toggleDropdown}
          content={dropdownContent}
          width={`${buttonWidth}px`}
          mobileWidth={`${buttonWidth}px`}
        />
      </DropdownWrapper>
    </Container>
  );
};

export default ButtonWithDropdown;

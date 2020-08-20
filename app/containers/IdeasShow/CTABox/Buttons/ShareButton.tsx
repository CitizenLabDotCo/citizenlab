import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import ButtonWithDropdown from 'components/UI/ButtonWithDropdown';
import IdeaCTAButton from './IdeaCTAButton';

const DropdownContainer = styled.div`
  width: 100%;
`;

const ShareButton = () => {
  const [dropdownOpened, setDropdownOpened] = useState(false);
  const [buttonWidth, setButtonWidth] = useState(0);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (ref.current) {
      setButtonWidth(ref.current.offsetWidth)
    }
  })

  const toggleDropdown = () => {
    setDropdownOpened(!dropdownOpened);
  }

  // TODO: add icon
  const buttonComponent = (
    <div ref={ref}>
      <IdeaCTAButton onClick={toggleDropdown} copy="Share this idea" />
    </div>
  );
  const dropdownContent = <DropdownContainer>test</DropdownContainer>;
  const dropdownWidth = `${buttonWidth}px`;

  return (
    <ButtonWithDropdown
      buttonComponent={buttonComponent}
      dropdownContent={dropdownContent}
      dropdownOpened={dropdownOpened}
      onClickOutside={toggleDropdown}
      dropdownWidth={dropdownWidth}
    />
  )
}

export default ShareButton;

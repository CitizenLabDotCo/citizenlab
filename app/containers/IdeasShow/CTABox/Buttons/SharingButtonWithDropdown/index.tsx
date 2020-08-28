import React, { useState, useRef, useEffect } from 'react';
import ButtonWithDropdown from 'components/UI/ButtonWithDropdown';
import IdeaCTAButton from '../IdeaCTAButton';
import SharingDropdownContent from './SharingDropdownContent';

const SharingButtonWithDropdown = () => {
  const [dropdownOpened, setDropdownOpened] = useState(false);
  const [buttonWidth, setButtonWidth] = useState(0);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (ref.current) {
      setButtonWidth(ref.current.offsetWidth);
    }
  });

  const toggleDropdown = () => {
    setDropdownOpened(!dropdownOpened);
  };

  // TODO: add icon
  return (
    <ButtonWithDropdown
      buttonComponent={
        <div ref={ref}>
          <IdeaCTAButton onClick={toggleDropdown} copy="Share this idea" />
        </div>
      }
      dropdownContent={<SharingDropdownContent />}
      dropdownOpened={dropdownOpened}
      onClickOutside={toggleDropdown}
      dropdownWidth={`${buttonWidth}px`}
    />
  );
};

export default SharingButtonWithDropdown;

import React, { useState, useRef, useEffect } from 'react';
import ButtonWithDropdown from 'components/UI/ButtonWithDropdown';
import IdeaCTAButton from '../IdeaCTAButton';
import SharingDropdownContent from './SharingDropdownContent';

export type UtmParams = {
  source: string;
  campaign: string;
  content?: string;
};

interface Props {
  context: 'idea' | 'project' | 'initiative' | 'folder';
  twitterMessage: string;
  emailSubject?: string;
  emailBody?: string;
  utmParams?: UtmParams;
  url: string;
}

const SharingButton = ({
  context,
  url,
  twitterMessage,
  emailSubject,
  emailBody,
  utmParams,
}: Props) => {
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
      dropdownContent={
        <SharingDropdownContent
          context={context}
          url={url}
          twitterMessage={twitterMessage}
          emailSubject={emailSubject}
          emailBody={emailBody}
          utmParams={utmParams}
        />
      }
      dropdownOpened={dropdownOpened}
      onClickOutside={toggleDropdown}
      dropdownWidth={`${buttonWidth}px`}
    />
  );
};

export default SharingButton;

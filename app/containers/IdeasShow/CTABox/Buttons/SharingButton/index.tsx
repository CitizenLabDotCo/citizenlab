import React, { useState } from 'react';
import ButtonWithDropdown from 'components/UI/ButtonWithDropdown';
import IdeaCTAButton from '../IdeaCTAButton';
import SharingDropdownContent from './SharingDropdownContent';

export type UtmParams = {
  source: string;
  campaign: string;
  content?: string;
};

interface Props {
  twitterMessage: string;
  emailSubject?: string;
  emailBody?: string;
  utmParams?: UtmParams;
  url: string;
  buttonCopy: string;
}

const SharingButton = ({
  url,
  twitterMessage,
  emailSubject,
  emailBody,
  utmParams,
  buttonCopy,
}: Props) => {
  // TODO: add icon
  return (
    <ButtonWithDropdown
      buttonComponent={
        <IdeaCTAButton iconName="share-arrow" copy={buttonCopy} />
      }
      dropdownContent={
        <SharingDropdownContent
          url={url}
          twitterMessage={twitterMessage}
          emailSubject={emailSubject}
          emailBody={emailBody}
          utmParams={utmParams}
        />
      }
    />
  );
};

export default SharingButton;

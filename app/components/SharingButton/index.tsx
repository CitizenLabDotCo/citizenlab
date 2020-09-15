import React from 'react';
import ButtonWithDropdown from 'components/UI/ButtonWithDropdown';
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
  buttonComponent: JSX.Element;
}

const SharingButton = ({
  url,
  twitterMessage,
  emailSubject,
  emailBody,
  utmParams,
  buttonComponent,
}: Props) => {
  // TODO: add icon
  return (
    <ButtonWithDropdown
      buttonComponent={buttonComponent}
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

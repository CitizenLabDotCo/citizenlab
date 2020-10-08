import React from 'react';
import ButtonWithDropdown from 'components/UI/ButtonWithDropdown';
import SharingButtonDropdownContent from './SharingButtonDropdownContent';

export type UtmParams = {
  source: string;
  campaign: string;
  content?: string;
};

interface Props {
  className?: string;
  twitterMessage: string;
  whatsAppMessage: string;
  emailSubject?: string;
  emailBody?: string;
  utmParams?: UtmParams;
  url: string;
  buttonComponent: JSX.Element;
}

const SharingButton = ({
  className,
  url,
  twitterMessage,
  whatsAppMessage,
  emailSubject,
  emailBody,
  utmParams,
  buttonComponent,
}: Props) => {
  return (
    <ButtonWithDropdown
      className={className}
      buttonComponent={buttonComponent}
      dropdownContent={
        <SharingButtonDropdownContent
          url={url}
          twitterMessage={twitterMessage}
          whatsAppMessage={whatsAppMessage}
          emailSubject={emailSubject}
          emailBody={emailBody}
          utmParams={utmParams}
        />
      }
    />
  );
};

export default SharingButton;

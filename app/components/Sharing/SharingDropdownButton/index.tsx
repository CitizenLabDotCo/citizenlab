import React from 'react';
import ButtonWithDropdown from 'components/UI/ButtonWithDropdown';
import DropdownContent from './SharingDropdownContent';

export type UtmParams = {
  source: string;
  campaign: string;
  content?: string;
};

export type Medium =
  | 'facebook'
  | 'twitter'
  | 'messenger'
  | 'whatsapp'
  | 'email';

interface Props {
  className?: string;
  twitterMessage: string;
  whatsAppMessage: string;
  emailSubject?: string;
  emailBody?: string;
  utmParams: UtmParams;
  url: string;
  buttonComponent: JSX.Element;
}

const SharingDropdownButton = ({
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
        <DropdownContent
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

export default SharingDropdownButton;

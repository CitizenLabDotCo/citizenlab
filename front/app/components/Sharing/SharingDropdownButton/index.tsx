import React from 'react';
import ButtonWithDropdown from 'components/UI/ButtonWithDropdown';
import SharingDropdownContent from './SharingDropdownContent';
import { UtmParams } from '../utils';

interface Props {
  className?: string;
  twitterMessage: string;
  whatsAppMessage: string;
  emailSubject: string;
  emailBody: string;
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
        <SharingDropdownContent
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

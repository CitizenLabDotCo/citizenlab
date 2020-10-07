import React from 'react';
import styled from 'styled-components';
import { isNilOrError } from 'utils/helperUtils';
import tracks from '../tracks';
import trackClickByEventName from './trackClickByEventName';
import useTenant from 'hooks/useTenant';
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from './messages';
import { Icon } from 'cl2-component-library';
import { UtmParams } from '../.';

const StyledIcon = styled(Icon)`
  width: 22px;
  height: 18px;
  margin-right: 10px;
`;

interface Props {
  whatsAppMessage: string;
  utmParams?: UtmParams;
}

const handleClick = (_event) => {
  trackClickByEventName(tracks.clickMessengerShare.name);
};

const WhatsApp = ({
  whatsAppMessage,
  utmParams,
  intl: { formatMessage },
}: Props & InjectedIntlProps) => {
  const buildUrl = (url: string) => {
    let resUrl = url;

    if (utmParams) {
      resUrl += `?utm_source=${utmParams.source}&utm_campaign=${utmParams.campaign}&utm_medium=whatsapp`;

      if (utmParams.content) {
        resUrl += `&utm_content=${utmParams.content}`;
      }
    }
    console.log(`resUrl: ${resUrl}`);
    return resUrl;
  };
  const hrefText = encodeURIComponent(whatsAppMessage);

  return (
    <a
      className="sharingButton"
      href={buildUrl(`https://api.whatsapp.com/send?phone=&text=${hrefText}`)}
      onClick={handleClick}
      role="button"
      aria-label={formatMessage(messages.shareViaWhatsApp)}
    >
      {/* <StyledIcon name="whatsapp" /> */}
      {'WhatsApp'}
    </a>
  );
};

export default injectIntl(WhatsApp);

import React from 'react';

// style
import styled from 'styled-components';
import { fontSizes, colors, viewportWidths } from 'utils/styleUtils';
import { darken } from 'polished';

// components
import Facebook from './Facebook';
import Messenger from './Messenger';
import Twitter from './Twitter';
import Email from './Email';

// hooks
import useWindowSize from 'hooks/useWindowSize';

const Container = styled.div`
  display: flex;
  flex-direction: column;
`;

const Buttons = styled.div`
  display: flex;
  flex-direction: column;

  .sharingButton {
    display: flex;
    align-items: center;
    padding: 10px 12px;
    border-radius: ${(props: any) => props.theme.borderRadius};
    cursor: pointer;
    transition: all 100ms ease-out;
    text-align: left;
    color: ${colors.label};
    font-size: ${fontSizes.base}px;

    &:hover {
      background-color: ${darken(0.06, 'white')};
    }
  }
`;

export type UtmParams = {
  source: string;
  campaign: string;
  content?: string;
};

interface Props {
  className?: string;
  url: string;
  twitterMessage: string;
  emailSubject?: string;
  emailBody?: string;
  utmParams?: UtmParams;
  id?: string;
}

const SharingDropdownContent = ({
  id,
  className,
  url,
  utmParams,
  emailBody,
  emailSubject,
  twitterMessage,
}: Props) => {
  const { windowWidth } = useWindowSize();
  const hasEmailSharing = !!(emailBody && emailSubject);
  const smallerThanBigTablet = windowWidth
    ? windowWidth <= viewportWidths.smallTablet
    : false;

  const buildUrl = (medium: string) => {
    let resUrl = url;

    if (utmParams) {
      resUrl += `?utm_source=${utmParams.source}&utm_campaign=${utmParams.campaign}&utm_medium=${medium}`;

      if (utmParams.content) {
        resUrl += `&utm_content=${utmParams.content}`;
      }
    }

    return resUrl;
  };

  return (
    <Container id={id || ''} className={className || ''}>
      <Buttons>
        <Facebook url={buildUrl('facebook')} />
        {smallerThanBigTablet && <Messenger url={buildUrl('messenger')} />}
        <Twitter
          url={buildUrl('twitter')}
          twitterMessage={twitterMessage}
          isLastItem={!hasEmailSharing}
        />
        {emailBody && emailSubject && (
          <Email emailBody={emailBody} emailSubject={emailSubject} />
        )}
      </Buttons>
    </Container>
  );
};

export default SharingDropdownContent;

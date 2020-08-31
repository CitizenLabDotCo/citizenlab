import React from 'react';

// components
import { Icon } from 'cl2-component-library';

// i18n
import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';

// style
import styled from 'styled-components';
import { media, fontSizes, colors } from 'utils/styleUtils';
import { darken } from 'polished';

// components
import Facebook from './Facebook';
import Messenger from './Messenger';
import Twitter from './Twitter';
import Email from './Email';

const Container = styled.div`
  display: flex;
  flex-direction: column;
`;

const Title = styled.h3`
  color: ${({ theme }) => theme.colorText};
  font-size: ${fontSizes.large}px;
  font-weight: 600;
  display: flex;
  align-items: center;
  margin: 0;
  margin-bottom: 12px;
  padding: 0;
`;

const StyledIcon = styled(Icon)`
  flex: 0 0 20px;
  width: 20px;
  height: 20px;
  fill: #fff;
`;

const Buttons = styled.div`
  display: flex;
  flex-wrap: wrap;

  .sharingButton {
    display: flex;
    align-items: center;
    justify-content: center;
    flex: 1;
    padding: 10px 12px;
    border-radius: ${(props: any) => props.theme.borderRadius};
    cursor: pointer;
    transition: all 100ms ease-out;
    margin-right: 5px;

    &.last {
      margin-right: 0px;
    }

    ${media.largePhone`
      flex-basis: calc(50% - 2.5px);

      &:nth-child(odd) {
        margin-right: 5px;

        &.last {
          margin-right: 0px;
        }
      }

      &:nth-child(-n+2) {
        margin-bottom: 5px;
      }

      &:nth-child(even) {
        margin-right: 0;
      }
    `}

    &.twitter {
      background: ${colors.twitter};
      color: #fff;

      &:hover {
        background: ${darken(0.15, colors.twitter)};
      }
    }

    &.facebook {
      background: ${colors.facebook};
      color: #fff;

      &:hover {
        background: ${darken(0.15, colors.facebook)};
      }
    }

    &.messenger {
      background: ${colors.facebookMessenger};
      color: #fff;

      &:hover {
        background: ${darken(0.15, colors.facebookMessenger)};
      }

      ${media.biggerThanMaxTablet`
        display: none;
      `}
    }

    &.email {
      color: #fff;
      background: ${(props: any) => props.theme.colorMain};

      ${StyledIcon} {
        fill: #fff;
      }

      &:hover {
        background: ${(props: any) => darken(0.1, props.theme.colorMain)};
      }
    }
  }
`;

export type UtmParams = {
  source: string;
  campaign: string;
  content?: string;
};

interface Props {
  context: 'idea' | 'project' | 'initiative' | 'folder';
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
  context,
  url,
  utmParams,
  emailBody,
  emailSubject,
  twitterMessage,
}: Props) => {
  const titleMessage = {
    idea: <FormattedMessage {...messages.shareIdea} />,
    project: <FormattedMessage {...messages.shareThisProject} />,
    initiative: <FormattedMessage {...messages.shareThisInitiative} />,
    folder: <FormattedMessage {...messages.shareThisFolder} />,
  }[context];
  const hasEmailSharing = !!(emailBody && emailSubject);

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
      <Title>{titleMessage}</Title>
      <Buttons>
        <Facebook url={buildUrl('facebook')} />
        {<Messenger url={buildUrl('messenger')} />}
        {
          <Twitter
            url={buildUrl('twitter')}
            twitterMessage={twitterMessage}
            isLastItem={!hasEmailSharing}
          />
        }
        {emailBody && emailSubject && (
          <Email emailBody={emailBody} emailSubject={emailSubject} />
        )}
      </Buttons>
    </Container>
  );
};

export default SharingDropdownContent;

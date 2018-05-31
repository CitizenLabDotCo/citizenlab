import React from 'react';
import { adopt } from 'react-adopt';

// libraries
import { FacebookButton, TwitterButton } from 'react-social';

// components
import Icon from 'components/UI/Icon';

// resources
import GetTenant, { GetTenantChildProps } from 'resources/GetTenant';
import GetAuthUser, { GetAuthUserChildProps } from 'resources/GetAuthUser';

// i18n

import messages from './messages';
import T from 'components/T';
import { InjectedIntlProps } from 'react-intl';
import { injectIntl } from 'utils/cl-intl';

// analytics
import { injectTracks } from 'utils/analytics';
import tracks from './tracks';

// style
import styled from 'styled-components';
import { media } from 'utils/styleUtils';
import { lighten } from 'polished';

// utils
import { isNilOrError } from 'utils/helperUtils';

// typtings
import { Multiloc } from 'typings';

const facebookColor = '#3b5998';

const twitterColor = '#1ea4f2';

const IconWrapper = styled.div`
  width: 30px;
  height: 38px;
  margin: 0;
  padding: 0;
  border: none;
  display: flex;
  align-items: center;
  justify-content: flex-start;

  svg {
    width: 18px;
    transition: all 100ms ease-out;
  }
`;

const Text = styled.div`
  max-width: 200px;
  font-size: 15px;
  line-height: 19px;
  text-align: left;
  font-weight: 400;
  transition: all 100ms ease-out;
  white-space: nowrap;
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;

  * {
    outline: none;
  }

  .sharingButton {
    display: flex;
    align-items: center;
    margin: 0;
    padding: 0;
    cursor: pointer;
    transition: all 100ms ease-out;

    ${media.smallerThanMaxTablet`
      /* margin: 0;
      margin-top: 10px;
      margin-bottom: 10px; */
    `}

    &.twitter {
      ${Text} {
        color: ${lighten(0.1, twitterColor)};
        color: #84939E;
      }

      ${IconWrapper} svg {
        fill: ${lighten(0.1, twitterColor)};
        fill: #84939E;
      }

      &:hover {
        ${Text} {
          color: ${twitterColor};
        }

        ${IconWrapper} svg {
          fill: ${twitterColor};
        }
      }
    }

    &.facebook {
      ${Text} {
        color: ${lighten(0.1, facebookColor)};
        color: #84939E;
      }

      ${IconWrapper} svg {
        fill: ${lighten(0.1, facebookColor)};
        fill: #84939E;
      }

      &:hover {
        ${Text} {
          color: ${facebookColor};
        }

        ${IconWrapper} svg {
          fill: ${facebookColor};
        }
      }
    }
  }
`;

interface ITracks {
  clickFbShare: () => void;
  clickTwitterShare: () => void;
}

type InputProps = {
  imageUrl: string | null;
  ideaTitle: Multiloc | null;
  className?: string;
};

interface DataProps {
  authUser: GetAuthUserChildProps;
  tenant: GetTenantChildProps;
}

interface Props extends InputProps, DataProps { }

class Sharing extends React.PureComponent<Props & ITracks & InjectedIntlProps> {
  render() {
    const { clickFbShare, clickTwitterShare, imageUrl, authUser, tenant, className, ideaTitle, intl } = this.props;
    if (!isNilOrError(tenant) && ideaTitle) {
      const { formatMessage } = intl;
      const facebookSettings = (tenant && tenant.attributes.settings.facebook_login ? tenant.attributes.settings.facebook_login : null);
      const facebookAppId = (facebookSettings ? facebookSettings.app_id : null);
      const href = window.location.href;
      const facebookText = formatMessage(messages.shareOnFacebook);
      const twitterText = formatMessage(messages.shareOnTwitter);
      const fbURL = (!isNilOrError(authUser)) ? `${href}?recruiter=${authUser.id}&utm_source=share_idea&utm_medium=facebook&utm_campaign=autopublish&utm_term=share_idea` : href;
      const twitterURL = (!isNilOrError(authUser)) ? `${href}?recruiter=${authUser.id}&utm_source=share_idea&utm_medium=twitter&utm_campaign=share_idea` : href;

      const facebook = (facebookAppId ? (
        <FacebookButton
          className="sharingButton facebook first"
          url={fbURL}
          appId={facebookAppId}
          sharer={true}
          media={imageUrl}
          onClick={clickFbShare}
        >
          <IconWrapper>
            <Icon name="facebook" />
          </IconWrapper>
          <Text>{facebookText}</Text>
        </FacebookButton>
      ) : null);

      const twitter = (
        <T value={ideaTitle} maxLength={50}>
          {(title) =>
            <TwitterButton
              className="sharingButton twitter"
              url={twitterURL}
              sharer={true}
              media={imageUrl}
              onClick={clickTwitterShare}
              message={formatMessage(messages.twitterMessage, { ideaTitle: title })}
            >
              <IconWrapper>
                <Icon name="twitter" />
              </IconWrapper>
              <Text>{twitterText}</Text>
            </TwitterButton>
          }
        </T>
      );

      return (
        <Container className={className}>
          {facebook}
          {twitter}
        </Container>
      );
    }

    return null;
  }
}

const SharingWithHocs = injectIntl<Props>(injectTracks<Props>({
  clickFbShare: tracks.clickFbShare,
  clickTwitterShare: tracks.clickTwitterShare,
})(Sharing));

const Data = adopt<DataProps, InputProps>({
  tenant: <GetTenant />,
  authUser: <GetAuthUser />,
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {dataProps => <SharingWithHocs {...inputProps} {...dataProps} />}
  </Data>
);

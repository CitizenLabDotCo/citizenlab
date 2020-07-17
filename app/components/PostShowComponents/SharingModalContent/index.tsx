import React, { PureComponent } from 'react';
import { isNilOrError } from 'utils/helperUtils';
import { adopt } from 'react-adopt';

// components
import Sharing from 'components/Sharing';
import { Spinner } from 'cl2-component-library';

// resources
import GetLocale, { GetLocaleChildProps } from 'resources/GetLocale';
import GetTenant, { GetTenantChildProps } from 'resources/GetTenant';
import GetAuthUser, { GetAuthUserChildProps } from 'resources/GetAuthUser';
import GetPost, { GetPostChildProps } from 'resources/GetPost';

// i18n
import {  InjectedIntlProps } from 'react-intl';
import injectIntl from 'utils/cl-intl/injectIntl';
import localize, { InjectedLocalized } from 'utils/localize';
import messages from './messages';

// tracking
import { trackEventByName } from 'utils/analytics';
import tracks from './tracks';

// style
import styled from 'styled-components';
import { fontSizes, colors, media } from 'utils/styleUtils';
import rocket from './rocket.png';

const Loading = styled.div`
  width: 100%;
  height: 460px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Container = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Rocket = styled.img`
  width: 40px;
  height: 40px;

  ${media.smallerThanMaxTablet`
    width: 35px;
    height: 35px;
  `}
`;

const Title = styled.h1`
  flex-shrink: 0;
  width: 100%;
  color: ${colors.text};
  font-size: ${fontSizes.xxxxl}px;
  line-height: 40px;
  font-weight: 500;
  text-align: center;
  margin: 0;
  margin-top: 20px;
  margin-bottom: 10px;
  padding: 0;

  ${media.smallerThanMaxTablet`
    max-width: auto;
    font-size: ${fontSizes.xxxl}px;
    line-height: 36px;
  `}
`;

const Description = styled.p`
  flex-shrink: 0;
  width: 100%;
  max-width: 500px;
  color: ${colors.text};
  font-size: ${fontSizes.large}px;
  line-height: 25px;
  font-weight: 300;
  text-align: center;
  margin: 0;
  margin-top: 10px;
  margin-bottom: 50px;
  padding: 0;

  ${media.smallerThanMaxTablet`
    font-size: ${fontSizes.base}px;
    line-height: 21px;
  `}
`;

const SharingWrapper = styled.div`
  flex-shrink: 0;
  width: 100%;
  max-width: 300px;
  display: flex;
  flex-direction: column;
`;

interface InputProps {
  postType: 'idea' | 'initiative';
  postId: string | null;
  className?: string;
  title: string;
  subtitle: string;
}

interface DataProps {
  locale: GetLocaleChildProps;
  tenant: GetTenantChildProps;
  authUser: GetAuthUserChildProps;
  post: GetPostChildProps;
}

interface Props extends InputProps, DataProps {}

interface State {}

class SharingModalContent extends PureComponent<Props & InjectedIntlProps & InjectedLocalized, State> {
  componentDidMount() {
    const { postId, postType } = this.props;

    trackEventByName(tracks.sharingModalOpened.name, {
      postId,
      postType
    });
  }

  render() {
    const { postType, post, authUser, localize, locale, className, title, subtitle } = this.props;
    const { formatMessage } = this.props.intl;

    if (!isNilOrError(post) && !isNilOrError(authUser)) {
      const postTitle = localize(post.attributes.title_multiloc);
      const postUrl = `${location.origin}/${locale}/${postType}s/${post.attributes.slug}`;
      const emailSharingSubject = {
        idea: messages.ideaEmailSharingSubject,
        initiative: messages.initiativeEmailSharingSubject,
      }[postType];
      const emailSharingBody = {
        idea: messages.ideaEmailSharingBody,
        initiative: messages.initiativeEmailSharingBody,
      }[postType];

      return (
        <Container className={className}>
          <Rocket src={rocket} alt="rocket" />
          <Title className={`e2e-${postType}-social-sharing-modal-title`}>
            {title}
          </Title>
          <Description>
            {subtitle}
          </Description>
          <SharingWrapper>
            <Sharing
              context={postType}
              location="modal"
              url={postUrl}
              twitterMessage={formatMessage(messages.twitterMessage, { postTitle })}
              emailSubject={formatMessage(emailSharingSubject, { postTitle })}
              emailBody={formatMessage(emailSharingBody, { postUrl })}
              utmParams={{
                source: `share_${postType}`,
                campaign: `${postType}flow`,
                content: authUser.id
              }}
            />
          </SharingWrapper>
        </Container>
      );
    }

    return (
      <Loading>
        <Spinner />
      </Loading>
    );
  }
}

const SharingModalContentWithHoCs = injectIntl<Props>(localize(SharingModalContent));

const Data = adopt<DataProps, InputProps>({
  locale: <GetLocale />,
  tenant: <GetTenant />,
  authUser: <GetAuthUser />,
  post: ({ postId, postType, render }) => <GetPost id={postId} type={postType}>{render}</GetPost>
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {dataProps => <SharingModalContentWithHoCs {...inputProps} {...dataProps} />}
  </Data>
);

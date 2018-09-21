import React from 'react';
import { isNilOrError } from 'utils/helperUtils';
import { adopt } from 'react-adopt';

// components
import Sharing from 'components/Sharing';
import Spinner from 'components/UI/Spinner';

// resources
import GetLocale, { GetLocaleChildProps } from 'resources/GetLocale';
import GetAuthUser, { GetAuthUserChildProps } from 'resources/GetAuthUser';
import GetIdea, { GetIdeaChildProps } from 'resources/GetIdea';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import {  InjectedIntlProps } from 'react-intl';
import injectIntl from 'utils/cl-intl/injectIntl';
import localize, { InjectedLocalized } from 'utils/localize';
import messages from './messages';

// tracking
import { injectTracks } from 'utils/analytics';
import tracks from './tracks';

// style
import styled from 'styled-components';
import { fontSizes, colors, media } from 'utils/styleUtils';

const rocket = require('./rocket.png');

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

const Subtitle = styled.h3`
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
  margin-bottom: 35px;
  padding: 0;

  ${media.smallerThanMaxTablet`
    font-size: ${fontSizes.base}px;
    line-height: 21px;
    margin-bottom: 20px;
  `}
`;

const SharingWrapper = styled.div`
  flex-shrink: 0;
  width: 100%;
  max-width: 300px;
  display: flex;
  flex-direction: column;
  padding-bottom: 40px;

  ${media.smallerThanMaxTablet`
    padding-bottom: 20px;
  `}
`;

interface InputProps {
  ideaId: string | null;
}

interface DataProps {
  locale: GetLocaleChildProps;
  authUser: GetAuthUserChildProps;
  idea: GetIdeaChildProps;
}

interface Props extends InputProps, DataProps {}

interface State {}

interface Tracks {
  sharingModalOpened: Function;
}

class IdeaSharingModalContent extends React.PureComponent<Props & InjectedIntlProps & InjectedLocalized & Tracks, State> {
  componentDidMount() {
    this.props.sharingModalOpened();
  }

  render() {
    const { idea, authUser, localize, locale } = this.props;
    const { formatMessage } = this.props.intl;

    if (!isNilOrError(idea) && !isNilOrError(authUser)) {
      const ideaTitle = localize(idea.attributes.title_multiloc);
      const ideaUrl = `${location.origin}/${locale}/ideas/${idea.attributes.slug}`;

      return (
        <Container>
          <Rocket src={rocket} alt="rocket" />
          <Title>
            <FormattedMessage {...messages.shareTitle} />
          </Title>
          <Subtitle>
            <FormattedMessage {...messages.shareSubtitle} />
          </Subtitle>
          <SharingWrapper>
            <Sharing
              url={ideaUrl}
              twitterMessage={formatMessage(messages.twitterMessage, { ideaTitle })}
              emailSubject={formatMessage(messages.emailSharingSubject, { ideaTitle })}
              emailBody={formatMessage(messages.emailSharingBody, { ideaUrl })}
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

const IdeaSharingModalContentWithHoCs = injectTracks<Props>({
  sharingModalOpened: tracks.sharingModalOpened,
  })(injectIntl(localize(IdeaSharingModalContent)));

const Data = adopt<DataProps, InputProps>({
  locale: <GetLocale />,
  authUser: <GetAuthUser />,
  idea: ({ ideaId, render }) => <GetIdea id={ideaId}>{render}</GetIdea>
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {dataProps => <IdeaSharingModalContentWithHoCs {...inputProps} {...dataProps} />}
  </Data>
);

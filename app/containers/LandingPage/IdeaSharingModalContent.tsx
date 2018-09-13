import React from 'react';
import { isNilOrError } from 'utils/helperUtils';
import { adopt } from 'react-adopt';

// components
import Sharing from 'components/Sharing';
import Spinner from 'components/UI/Spinner';

// resources
import GetAuthUser, { GetAuthUserChildProps } from 'resources/GetAuthUser';
import GetIdea, { GetIdeaChildProps } from 'resources/GetIdea';

// i18n
import T from 'components/T';
import { FormattedMessage } from 'utils/cl-intl';
import {  InjectedIntlProps } from 'react-intl';
import injectIntl from 'utils/cl-intl/injectIntl';
import messages from './messages';

// style
import styled from 'styled-components';
import { fontSizes, colors, media } from 'utils/styleUtils';

const rocket = require('./rocket.png');

const Loading = styled.div`
  width: 100%;
  height: 500px;
  display: flex;
  align-items: center;
  justify-content: center;

  ${media.smallerThanMaxTablet`
    height: 400px;
  `}
`;

const Container = styled.div`
  width: 100%;
  min-height: 500px;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-bottom: 20px;

  ${media.smallerThanMaxTablet`
    min-height: auto;
  `}
`;

const Rocket = styled.img`
  width: 35px;
  height: 35px;
`;

const Title = styled.h1`
  width: 100%;
  color: ${colors.text};
  font-size: ${fontSizes.xxxxl}px;
  line-height: 42px;
  font-weight: 500;
  text-align: center;
  margin-bottom: 10px;
`;

const Subtitle = styled.h3`
  width: 100%;
  max-width: 500px;
  color: ${colors.text};
  font-size: ${fontSizes.large}px;
  line-height: 25px;
  font-weight: 300;
  text-align: center;
  margin-bottom: 35px;
`;

const SharingWrapper = styled.div`
  width: 100%;
  max-width: 300px;
  display: flex;
  flex-direction: column;
`;

interface InputProps {
  ideaId: string | null;
}

interface DataProps {
  authUser: GetAuthUserChildProps;
  idea: GetIdeaChildProps;
}

interface Props extends InputProps, DataProps {}

interface State {}

class IdeaSharingModalContent extends React.PureComponent<Props & InjectedIntlProps, State> {
  render() {
    const { idea, authUser } = this.props;
    const { formatMessage } = this.props.intl;

    if (!isNilOrError(idea) && !isNilOrError(authUser)) {
      return (
        <Container>
          <Rocket src={rocket} alt="rocket" />
          <Title>
            <FormattedMessage {...messages.shareIdeaTitle} />
          </Title>
          <Subtitle>
            <FormattedMessage {...messages.shareIdeaSubtitle} />
          </Subtitle>
          <SharingWrapper>
            <T value={idea.attributes.title_multiloc} maxLength={50} >
              {(title) => {
                return (
                  <Sharing
                    twitterMessage={formatMessage(messages.twitterMessage, { ideaTitle: title })}
                    sharedContent="idea"
                    userId={authUser.id}
                  />);
              }}
            </T>
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

const IdeaSharingModalContentWithHoCs = injectIntl(IdeaSharingModalContent);

const Data = adopt<DataProps, InputProps>({
  authUser: <GetAuthUser />,
  idea: ({ ideaId, render }) => <GetIdea id={ideaId}>{render}</GetIdea>
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {dataProps => <IdeaSharingModalContentWithHoCs {...inputProps} {...dataProps} />}
  </Data>
);

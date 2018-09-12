import React from 'react';
import { isNilOrError } from 'utils/helperUtils';
import { adopt } from 'react-adopt';

// components
import Sharing from 'components/Sharing';

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
// import { media, color, colors, fontSizes, quillEditedContent } from 'utils/styleUtils';
// import { darken } from 'polished';

const rocket = require('./rocket.png');

const Container = styled.div`
  display: flex;
  justify-content: center;
`;

const SharingWrapper = styled.div`
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
          <img src={rocket} alt="rocket" />
          <FormattedMessage {...messages.shareYourIdeaTitle} />
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

    return null;
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

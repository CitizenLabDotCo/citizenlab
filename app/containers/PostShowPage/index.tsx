import React, { memo } from 'react';
import { isError } from 'lodash-es';
import { isNilOrError } from 'utils/helperUtils';
import { withRouter, WithRouterProps } from 'react-router';
import { adopt } from 'react-adopt';

// components
import IdeasShow from 'containers/IdeasShow';
import Button from 'components/UI/Button';
import ShowPageTopBar from './ShowPageTopBar';

// resources
import GetIdea, { GetIdeaChildProps } from 'resources/GetIdea';
import GetInitiative, { GetInitiativeChildProps } from 'resources/GetInitiative';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// style
import styled from 'styled-components';
import { fontSizes, colors, media } from 'utils/styleUtils';

const IdeaNotFoundWrapper = styled.div`
  height: calc(100vh - ${props => props.theme.menuHeight}px - 1px);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 4rem;
  font-size: ${fontSizes.large}px;
  color: ${colors.label};
`;

const Container = styled.div`
  background: #fff;
`;

const StyledShowPageTopBar = styled(ShowPageTopBar)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
`;

const StyledShow = styled(IdeasShow)`
  background: #fff;
  margin-top: ${props => props.theme.mobileTopBarHeight}px;

  ${media.biggerThanMaxTablet`
    margin-top: 0px;
  `}
`;

interface InputProps {
  postType: 'idea' | 'initiative';
}

interface DataProps {
  post: GetIdeaChildProps | GetInitiativeChildProps;
}

interface Props extends InputProps, DataProps {}

const goBackToListMessage = <FormattedMessage {...messages.goBackToList} />;

const IdeasShowPage = memo<Props>(({ post, postType }) => {

  if (isError(post)) {
    const message = postType === 'idea' ? messages.noIdeaFoundHere : messages.noInitiativeFoundHere;
    return (
      <IdeaNotFoundWrapper>
        <p><FormattedMessage {...message} /></p>
        <Button
          linkTo={postType === 'idea' ? '/ideas' : '/initiatives'}
          text={goBackToListMessage}
          icon="arrow-back"
          circularCorners={false}
        />
      </IdeaNotFoundWrapper>
    );
  }

  if (!isNilOrError(post)) {
    return (
      <Container>
        <StyledShowPageTopBar id={post.id} />
        <StyledShow id={post.id} />
      </Container>
    );
  }

  return null;
});

const Data = adopt<DataProps, InputProps & WithRouterProps>({
  post: ({ params, render, postType }) => {
    switch (postType) {
      case 'idea':
        return <GetIdea slug={params.slug}>{render}</GetIdea>;
      case 'initiative':
        return <GetInitiative slug={params.slug}>{render}</GetInitiative>;
    }
  }
});

export default withRouter<InputProps>((inputProps: InputProps & WithRouterProps) => (
  <Data {...inputProps}>
    {dataProps => <IdeasShowPage {...inputProps} {...dataProps} />}
  </Data>
));

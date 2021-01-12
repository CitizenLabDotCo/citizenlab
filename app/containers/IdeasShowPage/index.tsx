import React, { memo } from 'react';
import { isError } from 'lodash-es';
import { isNilOrError } from 'utils/helperUtils';
import { withRouter, WithRouterProps } from 'react-router';
import { adopt } from 'react-adopt';

// components
import IdeasShow from 'containers/IdeasShow';
import Button from 'components/UI/Button';
import IdeaShowPageTopBar from './IdeaShowPageTopBar';

// resources
import GetIdea, { GetIdeaChildProps } from 'resources/GetIdea';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// style
import styled from 'styled-components';
import { fontSizes, colors, media } from 'utils/styleUtils';

const IdeaNotFoundWrapper = styled.div`
  height: calc(
    100vh - ${(props) => props.theme.menuHeight + props.theme.footerHeight}px
  );
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

const StyledIdeaShowPageTopBar = styled(IdeaShowPageTopBar)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
`;

const StyledIdeasShow = styled(IdeasShow)`
  background: #fff;

  ${media.biggerThanMaxTablet`
    margin-top: 0px;
  `}
`;

interface InputProps {}

interface DataProps {
  idea: GetIdeaChildProps;
}

interface Props extends InputProps, DataProps {}

const goBackToListMessage = <FormattedMessage {...messages.goBackToList} />;

const IdeasShowPage = memo<Props>(({ idea }) => {
  if (isError(idea)) {
    return (
      <IdeaNotFoundWrapper>
        <p>
          <FormattedMessage {...messages.noResultsFound} />
        </p>
        <Button linkTo="/ideas" text={goBackToListMessage} icon="arrow-back" />
      </IdeaNotFoundWrapper>
    );
  }

  if (!isNilOrError(idea)) {
    return (
      <Container>
        <StyledIdeaShowPageTopBar ideaId={idea.id} />
        <StyledIdeasShow
          ideaId={idea.id}
          projectId={idea.relationships.project.data.id}
          insideModal={false}
        />
      </Container>
    );
  }

  return null;
});

const Data = adopt<DataProps, InputProps & WithRouterProps>({
  idea: ({ params, render }) => (
    <GetIdea ideaSlug={params.slug}>{render}</GetIdea>
  ),
});

export default withRouter<InputProps>(
  (inputProps: InputProps & WithRouterProps) => (
    <Data {...inputProps}>
      {(dataProps) => <IdeasShowPage {...inputProps} {...dataProps} />}
    </Data>
  )
);

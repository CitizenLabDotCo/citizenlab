import React from 'react';
import { isError } from 'lodash-es';
import { isNilOrError } from 'utils/helperUtils';
import { useParams } from 'react-router-dom';

// components
import IdeasShow from 'containers/IdeasShow';
import Button from 'components/UI/Button';
import IdeaShowPageTopBar from './IdeaShowPageTopBar';
import Link from 'utils/cl-router/Link';

// hooks
import { useWindowSize } from '@citizenlab/cl2-component-library';
import useIdea from 'hooks/useIdea';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// style
import styled from 'styled-components';
import { media, fontSizes, colors, viewportWidths } from 'utils/styleUtils';

const IdeaNotFoundWrapper = styled.div`
  height: calc(
    100vh - ${(props) => props.theme.menuHeight + props.theme.footerHeight}px
  );
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 4rem;
  font-size: ${fontSizes.l}px;
  color: ${colors.textSecondary};
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

// note: StyledIdeasShow styles defined here should match that in PostPageFullscreenModal!
const StyledIdeasShow = styled(IdeasShow)`
  min-height: calc(
    100vh - ${(props) => props.theme.menuHeight + props.theme.footerHeight}px
  );
  padding-top: 40px;
  padding-left: 60px;
  padding-right: 60px;

  ${media.tablet`
    min-height: calc(100vh - ${({
      theme: { mobileMenuHeight, mobileTopBarHeight },
    }) => mobileMenuHeight + mobileTopBarHeight}px);
    padding-top: 35px;
  `}

  ${media.phone`
    padding-top: 25px;
    padding-left: 15px;
    padding-right: 15px;
  `}
`;

const StyledSignInButton = styled(Button)`
  margin-bottom: 20px;
`;

const IdeasShowPage = () => {
  const { slug } = useParams() as { slug: string };
  const idea = useIdea({ ideaSlug: slug });
  const { windowWidth } = useWindowSize();
  const tablet = windowWidth <= viewportWidths.tablet;

  if (isError(idea)) {
    return (
      <IdeaNotFoundWrapper>
        <p>
          <FormattedMessage {...messages.sorryNoAccess} />
        </p>
        <StyledSignInButton
          linkTo="/sign-up"
          text={<FormattedMessage {...messages.signUp} />}
        />
        <Link to="/sign-in">
          <FormattedMessage {...messages.signIn} />
        </Link>
      </IdeaNotFoundWrapper>
    );
  }

  if (!isNilOrError(idea)) {
    return (
      <Container>
        {tablet && (
          <StyledIdeaShowPageTopBar
            projectId={idea.relationships.project.data.id}
            ideaId={idea.id}
            insideModal={false}
          />
        )}
        <StyledIdeasShow
          ideaId={idea.id}
          projectId={idea.relationships.project.data.id}
          insideModal={false}
        />
      </Container>
    );
  }

  return null;
};

export default IdeasShowPage;

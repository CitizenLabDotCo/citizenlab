import React from 'react';
import { isError } from 'lodash';
import { isNilOrError } from 'utils/helperUtils';
import { withRouter, WithRouterProps } from 'react-router';

// components
import IdeasShow from 'containers/IdeasShow';
import Button from 'components/UI/Button';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// style
import GetIdea from 'resources/GetIdea';
import styled from 'styled-components';
import { fontSizes, colors } from 'utils/styleUtils';

const Container = styled.div`
  background: #fff;
`;

const IdeaNotFoundWrapper = styled.div`
  height: calc(100vh - ${props => props.theme.menuHeight}px - 1px);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 4rem;
  font-size: ${fontSizes.large}px;
  color: ${colors.label};
`;

interface InputProps {}

export default withRouter<InputProps>((props: InputProps & WithRouterProps) => (
  <GetIdea slug={props.params.slug}>
    {(idea) => {
      if (isError(idea)) {
        return (
          <IdeaNotFoundWrapper>
            <p><FormattedMessage {...messages.noIdeaFoundHere} /></p>
            <Button
              linkTo="/ideas"
              text={<FormattedMessage {...messages.goBackToList} />}
              icon="arrow-back"
              circularCorners={false}
            />
          </IdeaNotFoundWrapper>
        );
      }

      if (!isNilOrError(idea)) {
        return (
          <Container>
            <IdeasShow ideaId={idea.id} />
          </Container>
        );
      }

      return null;
    }}
  </GetIdea>
));

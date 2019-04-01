import React, { PureComponent } from 'react';
import { isError } from 'lodash-es';
import { isNilOrError } from 'utils/helperUtils';
import { withRouter, WithRouterProps } from 'react-router';
import { adopt } from 'react-adopt';

// components
import IdeasShow from 'containers/IdeasShow';
import Button from 'components/UI/Button';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// style
import GetIdea, { GetIdeaChildProps } from 'resources/GetIdea';
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

interface DataProps {
  idea: GetIdeaChildProps;
}

interface Props extends InputProps, DataProps {}

interface State {}

class IdeasShowPage extends PureComponent<Props & WithRouterProps, State> {
  render() {
    const { idea } = this.props;

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
  }
}

const Data = adopt<DataProps, InputProps & WithRouterProps>({
  idea: ({ params, render }) => <GetIdea slug={params.slug}>{render}</GetIdea>
});

export default withRouter<InputProps>((inputProps: InputProps & WithRouterProps) => (
  <Data {...inputProps}>
    {dataProps => <IdeasShowPage {...inputProps} {...dataProps} />}
  </Data>
));

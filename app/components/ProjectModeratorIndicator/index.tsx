// Libraries
import React, { PureComponent } from 'react';

// Services
import { isProjectModerator } from 'services/permissions/roles';

// Resources
import GetAuthUser, { GetAuthUserChildProps } from 'resources/GetAuthUser';

// Components
import Icon from 'components/UI/Icon';
import ContentContainer from 'components/ContentContainer';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// Style
import styled from 'styled-components';
import { colors, fontSizes } from 'utils/styleUtils';
import { rgba, darken } from 'polished';

const Container = styled.div`
  display: flex;
  align-items: center;
  background: ${rgba(colors.draftYellow, .05)};
  padding: 16px;
  border-radius: 5px;
  margin-top: 15px;
`;

const StyledIcon = styled(Icon)`
  flex: 0 0 24px;
  width: 24px;
  height: 24px;
  fill: ${colors.draftYellow};
  padding: 0px;
  margin: 0px;
  margin-right: 12px;
`;

const Text = styled.div`
  color: ${colors.draftYellow};
  font-size: ${fontSizes.base}px;
  line-height: 21px;
  font-weight: 400;

  a {
    color: ${colors.draftYellow};
    font-weight: 400;
    text-decoration: underline;

    &:hover {
      color: ${darken(0.15, colors.draftYellow)};
    }
  }

  strong {
    font-weight: 600;
  }
`;

interface InputProps {
  projectId: string;
}

interface DataProps {
  authUser: GetAuthUserChildProps;
}

interface Props extends InputProps, DataProps {}

interface State {}

class ProjectModeratorIndicator extends PureComponent<Props, State> {
  render() {
    const { authUser, projectId } = this.props;

    if (authUser && projectId && isProjectModerator({ data: authUser }, projectId)) {
      return (
        <ContentContainer className={this.props['className']}>
          <Container>
            <StyledIcon name="shield" />
            <Text>
              <FormattedMessage {...messages.projectModeratorIndicator} />
            </Text>
          </Container>
        </ContentContainer>
      );
    }

    return null;
  }
}

export default ({ projectId }: InputProps) => (
  <GetAuthUser>
    {authUser => <ProjectModeratorIndicator authUser={authUser} projectId={projectId} />}
  </GetAuthUser>
);

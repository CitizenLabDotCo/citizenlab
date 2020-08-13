// Libraries
import React, { PureComponent } from 'react';

// Services
import { isProjectModerator } from 'services/permissions/roles';

// Resources
import GetAuthUser, { GetAuthUserChildProps } from 'resources/GetAuthUser';

// Components
import { Icon } from 'cl2-component-library';
import ContentContainer from 'components/ContentContainer';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// Style
import styled from 'styled-components';
import { colors, fontSizes } from 'utils/styleUtils';
import { rgba, darken } from 'polished';

const StyledContentContainer = styled(ContentContainer)``;

const Container = styled.div`
  display: flex;
  align-items: center;
  background: ${rgba(colors.draftYellow, 0.12)};
  padding: 16px;
  border-radius: ${(props: any) => props.theme.borderRadius};
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
  className?: string;
}

interface DataProps {
  authUser: GetAuthUserChildProps;
}

interface Props extends InputProps, DataProps {}

interface State {}

class ProjectModeratorIndicator extends PureComponent<Props, State> {
  render() {
    const { authUser, projectId, className } = this.props;

    if (
      authUser &&
      projectId &&
      isProjectModerator({ data: authUser }, projectId)
    ) {
      return (
        <StyledContentContainer className={className}>
          <Container>
            <StyledIcon name="shieldVerified" />
            <Text>
              <FormattedMessage {...messages.projectModeratorIndicator} />
            </Text>
          </Container>
        </StyledContentContainer>
      );
    }

    return null;
  }
}

export default (inputProps: InputProps) => (
  <GetAuthUser>
    {(authUser) => (
      <ProjectModeratorIndicator {...inputProps} authUser={authUser} />
    )}
  </GetAuthUser>
);

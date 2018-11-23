import React, { PureComponent } from 'react';
import styled from 'styled-components';

// services
import { postingButtonState, DisabledReasons } from 'services/ideaPostingRules';
import GetProject, { GetProjectChildProps } from 'resources/GetProject';
import GetPhase, { GetPhaseChildProps } from 'resources/GetPhase';
import GetAuthUser, { GetAuthUserChildProps } from 'resources/GetAuthUser';

// components
import Button, { ButtonStyles } from 'components/UI/Button';
import Tooltip from 'components/UI/Tooltip';
import Icon from 'components/UI/Icon';

// i18n
import { injectIntl, FormattedMessage } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from './messages';
import { adopt } from 'react-adopt';
import { isNilOrError } from 'utils/helperUtils';

// styling
import { fontSizes, colors } from 'utils/styleUtils';

const Container = styled.div``;

const StyledIcon = styled(Icon)`
  height: 2rem;
  width: 2rem;
  margin-right: 1rem;
`;

const TooltipWrapper = styled.div`
  padding: 15px;
  min-width: 300px;
  color: ${colors.popoverDarkFg};
  font-size: ${fontSizes.small}px;
  font-weight: 400;
  display: flex;
  align-items: center;
`;

interface DataProps {
  project: GetProjectChildProps;
  phase: GetPhaseChildProps;
  authUser: GetAuthUserChildProps;
}

interface InputProps {
  projectId?: string | undefined;
  phaseId?: string | undefined;
  style?: ButtonStyles;
  size?: '1' | '2' | '3' | '4';
  fullWidth?: boolean;
  padding?: string;
  className?: string;
}

interface Props extends InputProps, DataProps {}

class IdeaButton extends PureComponent<Props & InjectedIntlProps> {

  disabledMessages: { [key in DisabledReasons]: ReactIntl.FormattedMessage.MessageDescriptor } = {
    notPermitted: messages.postingNotPermitted,
    maybeNotPermitted: messages.postingMaybeNotPermitted,
    postingDisabled: messages.postingHereImpossible,
    projectInactive: messages.postingProjectInactive,
    notActivePhase: messages.postingNotActivePhase,
    futureEnabled: messages.postingHereImpossible,
  };

  render() {
    const { project, phase, authUser, className } = this.props;
    const { show, enabled, disabledReason } = postingButtonState({
      project,
      phase,
      signedIn: !isNilOrError(authUser)
    });

    if (show) {
      let { style, size, fullWidth } = this.props;
      const { padding } = this.props;
      const startAnIdeaText = this.props.intl.formatMessage(messages.startAnIdea);

      style = (style || 'primary');
      size = (size || '1');
      fullWidth = (fullWidth || false);

      return (
        <Container className={className}>
          <Tooltip
            enabled={!enabled && !!disabledReason}
            content={
              disabledReason ? (
                <TooltipWrapper>
                  <StyledIcon name="lock-outlined" />
                  <FormattedMessage
                    {...this.disabledMessages[disabledReason]}
                  />
                </TooltipWrapper>
              ) : null
            }
            backgroundColor={colors.popoverDarkBg}
            borderColor={colors.popoverDarkBg}
            top="57px"
          >
            <Button
              linkTo={(!isNilOrError(project) ? `/projects/${project.attributes.slug}/ideas/new` : '/ideas/new')}
              style={style}
              size={size}
              padding={padding}
              text={startAnIdeaText}
              disabled={!enabled}
              fullWidth={fullWidth}
            />
          </Tooltip>
        </Container>
      );
    }

    return null;
  }
}

const IdeaButtonWithHOCs = injectIntl<Props>(IdeaButton);

const Data = adopt<DataProps, InputProps>({
  authUser: <GetAuthUser />,
  project: ({ projectId, render, }) => <GetProject id={projectId}>{render}</GetProject>,
  phase: ({ phaseId, render }) => <GetPhase id={phaseId}>{render}</GetPhase>,
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {(dataProps) => <IdeaButtonWithHOCs {...inputProps} {...dataProps} />}
  </Data>
);

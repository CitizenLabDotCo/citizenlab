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
  padding?: string;
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
    const { project, phase, authUser } = this.props;

    const { show, enabled, disabledReason } = postingButtonState({
      project: isNilOrError(project) ? null : project,
      phaseContext: phase,
      signedIn: !isNilOrError(authUser)
    });

    if (show) {
      let { style, size } = this.props;
      const { padding } = this.props;
      const startAnIdeaText = this.props.intl.formatMessage(messages.startAnIdea);

      style = (style || 'primary');
      size = (size || '1');

      return (
        <Tooltip
          enabled={!enabled && !!disabledReason}
          content={disabledReason ?
            <TooltipWrapper>
              <StyledIcon name="lock-outlined" />
              <FormattedMessage
                {...this.disabledMessages[disabledReason]}
              />
            </TooltipWrapper>
          :
            null
          }
          backgroundColor={colors.popoverDarkBg}
          borderColor={colors.popoverDarkBg}
          top="57px"
        >
          <Button
            className={this.props['className']}
            linkTo={(isNilOrError(project) ? '/ideas/new' : `/projects/${project.attributes.slug}/ideas/new`)}
            style={style}
            size={size}
            padding={padding}
            text={startAnIdeaText}
            circularCorners={false}
            disabled={!enabled}
          />
        </Tooltip>
      );
    }

    return null;
  }
}

const IdeaButtonWithHOCs = injectIntl<Props>(IdeaButton);

const Data = adopt<DataProps, InputProps>({
  project: ({ projectId, render, }) => <GetProject id={projectId}>{render}</GetProject>,
  phase: ({ phaseId, render }) => <GetPhase id={phaseId}>{render}</GetPhase>,
  authUser: <GetAuthUser />
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {(dataProps) => <IdeaButtonWithHOCs {...inputProps} {...dataProps} />}
  </Data>
);

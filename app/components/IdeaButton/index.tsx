import React, { PureComponent } from 'react';
import styled from 'styled-components';

// services
import { getPostingPermission, DisabledReasons } from 'services/ideaPostingRules';
import GetProject, { GetProjectChildProps } from 'resources/GetProject';
import GetPhase, { GetPhaseChildProps } from 'resources/GetPhase';
import GetAuthUser, { GetAuthUserChildProps } from 'resources/GetAuthUser';

// components
import { ButtonContainerProps } from 'components/UI/Button';
import Tooltip from 'components/UI/Tooltip';
import { IPosition } from 'components/UI/Popover';
import Icon from 'components/UI/Icon';

// i18n
import { injectIntl, FormattedMessage } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from './messages';
import { adopt } from 'react-adopt';
import { isNilOrError } from 'utils/helperUtils';

// events
import { openVerificationModalWithContext } from 'containers/App/events';

// tracks
import { injectTracks } from 'utils/analytics';
import tracks from './tracks';

// styling
import { fontSizes, colors } from 'utils/styleUtils';

const Container = styled.div``;

const StyledIcon = styled(Icon)`
  width: 2rem;
  height: 2rem;
  margin-right: 1rem;
`;

const StyledA = styled.a`
  padding: 0;
  transition: all 100ms ease-out;

  &:hover,
  &:focus {
    text-decoration: underline;
  }
`;

const TooltipWrapper = styled.div`
  display: flex;
  align-items: center;
  min-width: 300px;
  color: ${colors.popoverDarkFg};
  font-size: ${fontSizes.small}px;
  font-weight: 400;
  padding: 15px;
`;

interface DataProps {
  project: GetProjectChildProps;
  phase: GetPhaseChildProps;
  authUser: GetAuthUserChildProps;
}

interface ITracks {
  clickNewIdea: ({ extra: object }) => void;
}

interface InputProps extends ButtonContainerProps {
  projectId?: string | undefined;
  phaseId?: string | undefined;
  className?: string;
  smallViewportTooltipPosition?: IPosition;
}

interface Props extends InputProps, DataProps { }

class IdeaButton extends PureComponent<Props & InjectedIntlProps & ITracks> {
  locationRef = window.location.href;

  disabledMessages: { [key in DisabledReasons]: ReactIntl.FormattedMessage.MessageDescriptor } = {
    notPermitted: messages.postingNotPermitted,
    maybeNotPermitted: messages.postingMaybeNotPermitted,
    postingDisabled: messages.postingHereImpossible,
    projectInactive: messages.postingProjectInactive,
    notActivePhase: messages.postingNotActivePhase,
    futureEnabled: messages.postingHereImpossible,
    notVerified: messages.postingNotVerified
  };

  onVerify = () => {
    openVerificationModalWithContext('ActionIdea');
  }

  onNewIdea = () => {
    this.props.clickNewIdea({ extra: { urlFrom: this.locationRef } });
  }

  render() {
    const { project, phase, authUser, className, smallViewportTooltipPosition } = this.props;
    const { show, enabled, disabledReason } = getPostingPermission({
      project,
      phase,
      authUser
    });

    if (show) {
      const  { fullWidth, height, style, size, bgColor, textColor, fontWeight, padding, borderRadius } = this.props;
      const startAnIdeaText = this.props.intl.formatMessage(messages.startAnIdea);
      const linkTo = !isNilOrError(project) ? `/projects/${project.attributes.slug}/ideas/new` : '/ideas/new';
      const numberHeight = parseInt(height as any, 10);

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
                    values={{
                      verificationLink:
                        <StyledA href="" onClick={this.onVerify} className="tooltipLink">
                          <FormattedMessage {...messages.verificationLinkText} />
                        </StyledA>,
                    }}
                  />
                </TooltipWrapper>
              ) : null
            }
            backgroundColor={colors.popoverDarkBg}
            borderColor={colors.popoverDarkBg}
            offset={numberHeight ? numberHeight + 3 : 45}
            position="bottom"
            buttonProps={{
              style,
              size,
              height,
              fullWidth,
              bgColor,
              textColor,
              fontWeight,
              padding,
              borderRadius,
              linkTo,
              text: startAnIdeaText,
              disabled: !enabled,
              onClick: this.onNewIdea
            }}
            smallViewportPosition={smallViewportTooltipPosition}
            withPin={true}
          />
        </Container>
      );
    }

    return null;
  }
}

const IdeaButtonWithHOCs = injectIntl<Props>(injectTracks<Props & InjectedIntlProps>(tracks)(IdeaButton));

const Data = adopt<DataProps, InputProps>({
  authUser: <GetAuthUser />,
  project: ({ projectId, render, }) => <GetProject id={projectId}>{render}</GetProject>,
  phase: ({ phaseId, render }) => <GetPhase id={phaseId}>{render}</GetPhase>
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {(dataProps) => <IdeaButtonWithHOCs {...inputProps} {...dataProps} />}
  </Data>
);

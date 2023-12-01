import React from 'react';
import styled from 'styled-components';
import { fontSizes, colors } from 'utils/styleUtils';
import { Icon } from '@citizenlab/cl2-component-library';
import { FormattedMessage, useIntl } from 'utils/cl-intl';
import { IIdeaPostingDisabledReason } from 'utils/actionTakingRules';
import { MessageDescriptor } from 'react-intl';
import messages from './messages';
import globalMessages from 'utils/messages';
import { triggerAuthenticationFlow } from 'containers/Authentication/events';
import { trackEventByName } from 'utils/analytics';
import tracks from './tracks';
import { SuccessAction } from 'containers/Authentication/SuccessActions/actions';
import useProjectById from 'api/projects/useProjectById';
import { IPhaseData } from 'api/phases/types';

const TooltipContent = styled.div<{ inMap?: boolean }>`
  display: flex;
  align-items: center;
  padding: ${(props) => (props.inMap ? '0px' : '15px')};
`;

const TooltipContentIcon = styled(Icon)`
  flex: 0 0 24px;
  margin-right: 1rem;
`;

const TooltipContentText = styled.div`
  flex: 1 1 auto;
  color: ${({ theme }) => theme.colors.tenantText};
  font-size: ${fontSizes.base}px;
  line-height: normal;
  font-weight: 400;
  overflow-wrap: break-word;
  word-wrap: break-word;
  word-break: break-word;
  a,
  button {
    color: ${colors.teal};
    font-size: ${fontSizes.base}px;
    line-height: normal;
    font-weight: 400;
    text-align: left;
    text-decoration: underline;
    white-space: normal;
    overflow-wrap: break-word;
    word-wrap: break-word;
    word-break: break-all;
    word-break: break-word;
    hyphens: auto;
    display: inline;
    padding: 0px;
    margin: 0px;
    cursor: pointer;
    transition: all 100ms ease-out;
    &:hover {
      color: ${colors.teal700};
      text-decoration: underline;
    }
  }
`;
interface Props {
  projectId: string;
  inMap: boolean;
  disabledReason: IIdeaPostingDisabledReason;
  phase: IPhaseData | undefined;
}

const disabledMessages: {
  [key in IIdeaPostingDisabledReason]: MessageDescriptor;
} = {
  notPermitted: messages.postingNoPermission,
  postingDisabled: messages.postingDisabled,
  postingLimitedMaxReached: messages.postingLimitedMaxReached,
  projectInactive: messages.postingInactive,
  futureEnabled: messages.postingNotYetPossible,
  notActivePhase: messages.postingInNonActivePhases,
  maybeNotPermitted: messages.postingMayNotBePermitted,
  notInGroup: globalMessages.notInGroup,
};

const TippyContent = ({ projectId, inMap, disabledReason, phase }: Props) => {
  const { formatMessage } = useIntl();
  const { data: project } = useProjectById(projectId);
  if (!project) return null;

  const context = phase?.id
    ? ({
        action: 'posting_idea',
        id: phase?.id,
        type: 'phase',
      } as const)
    : null;
  const signUpIn =
    (flow: 'signup' | 'signin') => (event?: React.MouseEvent) => {
      event?.preventDefault();

      const successAction: SuccessAction = {
        name: 'redirectToIdeaForm',
        params: {
          projectSlug: project.data.attributes.slug,
          phaseId: phase?.id,
        },
      };

      if (context) {
        trackEventByName(tracks.signUpInModalOpened);

        triggerAuthenticationFlow({
          flow,
          context,
          successAction,
        });
      }
    };

  const signIn = (event?: React.MouseEvent) => {
    signUpIn('signin')(event);
  };

  const signUp = (event?: React.MouseEvent) => {
    signUpIn('signup')(event);
  };

  return (
    <TooltipContent
      id="tooltip-content"
      className="e2e-disabled-tooltip"
      inMap={inMap}
    >
      <TooltipContentIcon name="lock" ariaHidden />
      <TooltipContentText>
        <FormattedMessage
          {...disabledMessages[disabledReason]}
          values={{
            verificationLink: (
              <button onClick={signUp}>
                {formatMessage(messages.verificationLinkText)}
              </button>
            ),
            signUpLink: (
              <button onClick={signUp}>
                {formatMessage(messages.signUpLinkText)}
              </button>
            ),
            signInLink: (
              <button onClick={signIn}>
                {formatMessage(messages.signInLinkText)}
              </button>
            ),
          }}
        />
      </TooltipContentText>
    </TooltipContent>
  );
};

export default TippyContent;

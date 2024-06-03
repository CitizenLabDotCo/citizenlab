import React from 'react';

import { fontSizes, colors, Icon } from '@citizenlab/cl2-component-library';
import { MessageDescriptor } from 'react-intl';
import styled from 'styled-components';

import { IPhaseData } from 'api/phases/types';
import useProjectById from 'api/projects/useProjectById';

import { IIdeaPostingDisabledReason } from 'utils/actionTakingRules';
import { FormattedMessage } from 'utils/cl-intl';
import globalMessages from 'utils/messages';

import messages from './messages';

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
    word-break: break-word;
    hyphens: auto;
    display: inline;
    padding: 0;
    margin: 0;
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
  phase: IPhaseData;
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
  notInGroup: globalMessages.notInGroup,
};

const TippyContent = ({ projectId, inMap, disabledReason }: Props) => {
  const { data: project } = useProjectById(projectId);
  if (!project) return null;

  return (
    <TooltipContent
      id="tooltip-content"
      className="e2e-disabled-tooltip"
      inMap={inMap}
    >
      <TooltipContentIcon name="lock" ariaHidden />
      <TooltipContentText>
        <FormattedMessage {...disabledMessages[disabledReason]} />
      </TooltipContentText>
    </TooltipContent>
  );
};

export default TippyContent;

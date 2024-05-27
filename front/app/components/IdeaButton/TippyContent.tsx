import React from 'react';

import { fontSizes, colors, Icon } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import { IPhaseData } from 'api/phases/types';
import useProjectById from 'api/projects/useProjectById';

import { getPermissionsDisabledMessage } from 'utils/actionDescriptors';
import { ProjectPostingDisabledReason } from 'utils/actionDescriptors/types';
import { FormattedMessage } from 'utils/cl-intl';

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
  disabledReason: ProjectPostingDisabledReason;
  phase: IPhaseData | undefined;
}

const TippyContent = ({ projectId, inMap, disabledReason }: Props) => {
  const { data: project } = useProjectById(projectId);
  if (!project) return null;

  const disabledMessage = getPermissionsDisabledMessage(
    'posting_idea',
    disabledReason
  );

  return (
    <TooltipContent
      id="tooltip-content"
      className="e2e-disabled-tooltip"
      inMap={inMap}
    >
      <TooltipContentIcon name="lock" ariaHidden />
      <TooltipContentText>
        <FormattedMessage {...disabledMessage} />
      </TooltipContentText>
    </TooltipContent>
  );
};

export default TippyContent;

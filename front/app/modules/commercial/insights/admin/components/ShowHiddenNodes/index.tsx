import React from 'react';

// utils
import { isNilOrError } from 'utils/helperUtils';
import { colors } from 'utils/styleUtils';

// styles
import styled from 'styled-components';

// components
import { Box, Icon } from '@citizenlab/cl2-component-library';
import { TooltipContentList } from 'modules/commercial/insights/admin/components/StyledTextComponents';
import Tippy from '@tippyjs/react';

// intl
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from '../../containers/Insights/messages';

const Button = styled.button`
  cursor: pointer;
  width: fit-content;
  margin-top: 12px;
  padding: 0;
`;

export type NodeName = {
  id: string;
  name: string;
};

type ShowHiddenNodesProps = {
  hiddenNodes: string[];
  nodesNames: NodeName[] | false;
  handleShowHiddenNodesClick: () => void;
};

const ShowHiddenNodes = ({
  hiddenNodes,
  nodesNames,
  handleShowHiddenNodesClick,
  intl: { formatMessage },
}: ShowHiddenNodesProps & InjectedIntlProps) => {
  if (isNilOrError(hiddenNodes) || hiddenNodes.length === 0 || !nodesNames) {
    return null;
  }
  const hiddenNodesNames = hiddenNodes.map((nodeId) =>
    nodesNames.find((node: NodeName) => node.id === nodeId)
  );
  const hiddenNodesCount = hiddenNodes.length;
  return (
    <Button
      onClick={handleShowHiddenNodesClick}
      data-testid="insightsShowHiddenNodes"
    >
      <Tippy
        content={
          <TooltipContentList>
            {(hiddenNodesCount > 10
              ? [...hiddenNodesNames.slice(0, 10), { id: '', name: '...' }]
              : hiddenNodesNames
            ).map(({ id, name }: NodeName) => (
              <li key={id}>{name}</li>
            ))}
          </TooltipContentList>
        }
        placement="bottom"
        trigger="mouseenter"
      >
        <Box data-testid="insightsShowHiddenNodesContent">
          <Icon
            width="17px"
            height="17px"
            fill={colors.label}
            margin=" 0 5px 3px 0"
            name="eye"
          />
          {formatMessage(messages.networkShowHiddenNodes, {
            count: hiddenNodesCount,
          })}
        </Box>
      </Tippy>
    </Button>
  );
};

export default injectIntl(ShowHiddenNodes);

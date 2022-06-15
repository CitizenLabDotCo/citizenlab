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

// typings
import { IInsightsNetworkNodeMeta } from 'modules/commercial/insights/admin/containers/Insights/Details/Network';
import { NodeObject } from 'react-force-graph-2d';

// intl

import { FormattedMessage } from 'react-intl';
import messages from '../../containers/Insights/messages';

const TooltipIcon = styled(Icon)`
  width: 17px;
  height: 17px;
  fill: ${colors.label};
  margin: 0 5px 3px 0;
`;

type Node = NodeObject & IInsightsNetworkNodeMeta;
type ShowHiddenNodesProps = {
  hiddenNodes: Node[];
  handleShowHiddenNodesClick: () => void;
};

const ShowHiddenNodes = ({
  hiddenNodes,
  handleShowHiddenNodesClick,
}: ShowHiddenNodesProps) => {
  if (isNilOrError(hiddenNodes) || hiddenNodes.length === 0) {
    return null;
  }

  return (
    <Box
      mt="12px"
      style={{
        cursor: 'pointer',
        width: 'fit-content',
      }}
      onClick={handleShowHiddenNodesClick}
      data-testid="insightsShowHiddenNodes"
    >
      <Tippy
        content={
          <TooltipContentList>
            {(hiddenNodes.length > 10
              ? [...hiddenNodes.slice(0, 10), { id: '', name: '...' }]
              : hiddenNodes
            ).map((node: Node) => (
              <li key={node.id}>{node.name}</li>
            ))}
          </TooltipContentList>
        }
        placement="bottom"
        trigger="mouseenter"
      >
        <Box data-testid="insightsShowHiddenNodesContent">
          <TooltipIcon name="eye" />
          <FormattedMessage
            {...messages.networkShowHiddenNodes}
            values={{
              count: hiddenNodes.length,
            }}
          />
        </Box>
      </Tippy>
    </Box>
  );
};

export default ShowHiddenNodes;

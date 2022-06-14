import React from 'react';

// utils
import { isNilOrError } from 'utils/helperUtils';

// components
import { Box, IconTooltip } from '@citizenlab/cl2-component-library';
import { TooltipContentList } from 'modules/commercial/insights/admin/components/StyledTextComponents';

// typings
import { IInsightsNetworkNodeMeta } from 'modules/commercial/insights/admin/containers/Insights/Details/Network';
import { NodeObject } from 'react-force-graph-2d';

// intl
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from '../../containers/Insights/messages';

type Node = NodeObject & IInsightsNetworkNodeMeta;
type ShowHiddenNodesProps = {
  hiddenNodes: Node[];
  handleShowHiddenNodesClick: () => void;
};

const ShowHiddenNodes = ({
  hiddenNodes,
  handleShowHiddenNodesClick,
  intl: { formatMessage },
}: ShowHiddenNodesProps & InjectedIntlProps) => {
  if (isNilOrError(hiddenNodes) || hiddenNodes.length <= 0) {
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
    >
      <IconTooltip
        mr="5px"
        icon="eye"
        placement="bottom"
        content={
          <TooltipContentList>
            {(hiddenNodes.length > 10
              ? [...hiddenNodes.slice(0, 9), '...']
              : hiddenNodes
            ).map((node: Node) => (
              <li key={node.id}>{node.name}</li>
            ))}
          </TooltipContentList>
        }
      />
      {formatMessage(messages.networkShowHiddenNodes) +
        ` (${hiddenNodes.length})`}
    </Box>
  );
};

export default injectIntl(ShowHiddenNodes);

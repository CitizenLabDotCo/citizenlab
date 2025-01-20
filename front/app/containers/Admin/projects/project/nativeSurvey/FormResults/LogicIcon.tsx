import {
  Button,
  colors,
  Icon,
  Tooltip,
} from '@citizenlab/cl2-component-library';
import React from 'react';
import { LogicConfig } from 'api/survey_results/types';
import { useIntl } from 'utils/cl-intl';
import messages from './messages';

interface LogicIconProps {
  logicConfig?: LogicConfig;
  logicFilterId: string | null;
  type: 'page' | 'option';
}

const LogicIcon = ({ logicConfig, logicFilterId, type }: LogicIconProps) => {
  const { formatMessage } = useIntl();

  if (!logicConfig || !logicFilterId) return null;

  const tooltipContent = formatMessage(
    type == 'page'
      ? messages.logicSkipTooltipPage
      : messages.logicSkipTooltipOption
  );

  return (
    <Tooltip
      maxWidth="250px"
      theme="dark"
      placement="right"
      content={tooltipContent}
    >
      <Button
        p="0px"
        m="0px"
        ml="12px"
        bgColor={
          logicConfig.filterLogicIds.includes(logicFilterId)
            ? colors.coolGrey300
            : colors.white
        }
        processing={logicConfig.isLoading}
        onClick={() => {
          logicConfig.toggleLogicIds(logicFilterId);
        }}
      >
        <Icon
          fill={colors.coolGrey500}
          width="18px"
          name="logic"
          my="auto"
          mx="5px"
        />
      </Button>
    </Tooltip>
  );
};

export default LogicIcon;

import React from 'react';

import { Button, colors, Tooltip } from '@citizenlab/cl2-component-library';

import { LogicConfig } from 'api/survey_results/types';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';

interface LogicIconProps {
  logicConfig?: LogicConfig;
  logicFilterId: string | null;
  nextPageNumber: number | null;
  type: 'page' | 'option';
}

const LogicIcon = ({
  logicConfig,
  logicFilterId,
  nextPageNumber,
  type,
}: LogicIconProps) => {
  const { formatMessage } = useIntl();

  if (!logicConfig || !logicFilterId || !nextPageNumber) return null;

  // Note: 999 is a special number used for the survey end
  const tooltipContent = formatMessage(
    type === 'page'
      ? nextPageNumber === 999
        ? messages.logicSkipTooltipPageSurveyEnd
        : messages.logicSkipTooltipPage
      : nextPageNumber === 999
      ? messages.logicSkipTooltipOptionSurveyEnd
      : messages.logicSkipTooltipOption,
    {
      pageNumber: nextPageNumber,
    }
  );

  return (
    <Tooltip
      maxWidth="250px"
      theme="dark"
      placement="right"
      content={tooltipContent}
    >
      <Button
        p="4px"
        m="0"
        ml="12px"
        icon="logic"
        bgColor={
          logicConfig.filterLogicIds.includes(logicFilterId)
            ? colors.green500
            : colors.white
        }
        iconColor={
          logicConfig.filterLogicIds.includes(logicFilterId)
            ? colors.white
            : colors.coolGrey500
        }
        iconSize="18px"
        processing={logicConfig.isLoading} // TODO: JS - why is this always false?
        onClick={() => {
          logicConfig.toggleLogicIds(logicFilterId);
        }}
      />
    </Tooltip>
  );
};

export default LogicIcon;

import React from 'react';

import { Button, colors, Tooltip } from '@citizenlab/cl2-component-library';

import { LogicConfig, ResultLogic } from 'api/survey_results/types';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';

interface LogicIconProps {
  logicConfig?: LogicConfig;
  logicFilterId: string | null;
  fieldLogic?: ResultLogic;
  type: 'page' | 'option';
}

const LogicIcon = ({
  logicConfig,
  logicFilterId,
  fieldLogic,
  type,
}: LogicIconProps) => {
  const { formatMessage } = useIntl();

  if (!logicConfig || !logicFilterId || !fieldLogic?.nextPageNumber) {
    return null;
  }

  // Note: 999 is a special number used for the survey end
  const tooltipContent = formatMessage(
    type === 'page'
      ? fieldLogic.nextPageNumber === 999
        ? messages.logicSkipTooltipPageSurveyEnd
        : messages.logicSkipTooltipPage
      : fieldLogic.nextPageNumber === 999
      ? messages.logicSkipTooltipOptionSurveyEnd
      : messages.logicSkipTooltipOption,
    {
      pageNumber: fieldLogic.nextPageNumber,
      numQuestionsSkipped: fieldLogic.numQuestionsSkipped || 0,
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

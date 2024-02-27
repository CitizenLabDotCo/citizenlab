import React from 'react';

// components
import {
  Box,
  Select,
  SelectIcon,
  SelectWrapper,
  Label,
  IconTooltip,
  TooltipContentWrapper,
} from '@citizenlab/cl2-component-library';
import Tippy from '@tippyjs/react';

// i18n
import { useIntl } from 'utils/cl-intl';
import messages from './messages';

// typings
import { GroupMode } from 'api/graph_data_units/requestTypes';

// hooks
import useFeatureFlag from 'hooks/useFeatureFlag';

type Option = { value: GroupMode | ''; label: string };

interface Props {
  mode?: GroupMode;
  onChange: (mode?: GroupMode) => void;
}

const GroupModeSelect = ({ mode, onChange }: Props) => {
  const { formatMessage } = useIntl();
  const isGroupingEnabled = useFeatureFlag({ name: 'report_data_grouping' });

  const handleChange = ({ value }: Option) => {
    onChange(value === '' ? undefined : (value as GroupMode));
  };

  const options: Option[] = [
    { value: '', label: formatMessage(messages.none) },
    { value: 'user_field', label: formatMessage(messages.userField) },
    { value: 'survey_question', label: formatMessage(messages.surveyQuestion) },
  ];

  const label = formatMessage(messages.groupMode);
  const groupModeTooltip = formatMessage(messages.groupModeTooltip);
  const featureLockedReason = formatMessage(messages.featureLockedReason);

  return (
    <Box width="100%" mb="20px">
      {isGroupingEnabled ? (
        <Select
          id="e2e-group-mode-select"
          label={label}
          labelTooltipText={groupModeTooltip}
          labelTooltipPlacement="auto"
          value={mode ?? ''}
          options={options}
          onChange={handleChange}
        />
      ) : (
        <div>
          <Label>
            <span>{label}</span>
            <IconTooltip content={groupModeTooltip} placement="auto" />
          </Label>
          <Tippy
            interactive={true}
            placement="bottom" // not to block label tooltip icon
            theme={''}
            maxWidth={350}
            content={
              <TooltipContentWrapper tippytheme="light">
                {featureLockedReason}
              </TooltipContentWrapper>
            }
          >
            <SelectWrapper>
              <select disabled />
              <SelectIcon name="lock" ariaHidden className="disabled" />
            </SelectWrapper>
          </Tippy>
        </div>
      )}
    </Box>
  );
};

export default GroupModeSelect;

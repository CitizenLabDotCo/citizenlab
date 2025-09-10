import React from 'react';

import { ICustomFieldInputType } from 'api/custom_fields/types';

import { Drag } from '../DragAndDrop';

import ToolboxItem from './ToolboxItem';

interface DraggableToolboxItemProps {
  label: string;
  icon: React.ComponentProps<typeof ToolboxItem>['icon'];
  inputType: ICustomFieldInputType;
  fieldsToInclude?: ICustomFieldInputType[];
  disabled?: boolean;
  disabledTooltipMessage?: React.ComponentProps<
    typeof ToolboxItem
  >['disabledTooltipMessage'];
  showAIUpsell?: boolean;
  'data-cy'?: string;
  index?: number; // Add index prop
}

const DraggableToolboxItem = ({
  inputType,
  label,
  icon,
  fieldsToInclude,
  disabled,
  disabledTooltipMessage,
  showAIUpsell,
  'data-cy': dataCy,
  index = 0, // Default to 0 if not provided
}: DraggableToolboxItemProps) => {
  if (fieldsToInclude && !fieldsToInclude.includes(inputType)) {
    return null;
  }

  return (
    <Drag
      id={`toolbox-${inputType}`}
      index={index} // Use the provided index
      useBorder={false}
      isDragDisabled={disabled}
    >
      <ToolboxItem
        icon={icon}
        label={label}
        onClick={() => {}} // No longer needed as we're using drag and drop
        fieldsToInclude={fieldsToInclude}
        inputType={inputType}
        disabled={disabled}
        disabledTooltipMessage={disabledTooltipMessage}
        showAIUpsell={showAIUpsell}
        data-cy={dataCy}
      />
    </Drag>
  );
};

export default DraggableToolboxItem;

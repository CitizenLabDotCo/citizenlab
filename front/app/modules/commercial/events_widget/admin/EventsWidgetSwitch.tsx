import React from 'react';

// Components
import { WideSectionField } from 'containers/Admin/settings/customize';
import {
  Setting,
  ToggleLabel,
  StyledToggle,
  LabelContent,
  LabelTitle,
  LabelDescription,
} from 'containers/Admin/settings/general';

interface Props {
  checked: boolean;
  onChange: () => void;
  title: string;
  description: string;
}

export default ({ checked, onChange, title, description }: Props) => (
  <>
    <WideSectionField>
      <Setting>
        <ToggleLabel>
          <StyledToggle checked={checked} onChange={onChange} />
          <LabelContent>
            <LabelTitle>{title}</LabelTitle>
            <LabelDescription>{description}</LabelDescription>
          </LabelContent>
        </ToggleLabel>
      </Setting>
    </WideSectionField>
  </>
);

import React from 'react';

import RangeInput from 'components/UI/RangeInput';
import messages from 'containers/Admin/settings/messages';
import { ColorPickerSectionField } from 'containers/Admin/settings/customize';
import { IAppConfigurationStyle } from 'services/appConfiguration';
import { Label, ColorPickerInput } from 'cl2-component-library';
import { FormattedMessage } from 'utils/cl-intl';

import { SectionField } from 'components/admin/Section';

type Props = {
  onChange: (key: string) => (value: unknown) => void;
  latestAppConfigStyleSettings?: IAppConfigurationStyle | null;
  theme: any;
};

const CustomStyleInputs = ({
  theme,
  onChange,
  latestAppConfigStyleSettings,
}: Props) => {
  return (
    <>
      <ColorPickerSectionField>
        <Label>
          <FormattedMessage {...messages.imageOverlayColor} />
        </Label>
        <ColorPickerInput
          type="text"
          value={
            latestAppConfigStyleSettings?.signedOutHeaderOverlayColor ||
            theme.colorMain
          }
          onChange={onChange('signedOutHeaderOverlayColor')}
        />
      </ColorPickerSectionField>
      <SectionField>
        <Label>
          <FormattedMessage {...messages.imageOverlayOpacity} />
        </Label>
        <RangeInput
          step={1}
          min={0}
          max={100}
          value={
            latestAppConfigStyleSettings?.signedOutHeaderOverlayOpacity || 90
          }
          onChange={onChange('signedOutHeaderOverlayOpacity')}
        />
      </SectionField>
    </>
  );
};

export default CustomStyleInputs;

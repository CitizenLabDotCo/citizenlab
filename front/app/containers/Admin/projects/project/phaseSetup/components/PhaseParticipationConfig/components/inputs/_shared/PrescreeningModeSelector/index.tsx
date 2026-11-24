import React from 'react';

import { Box, Select, Text, Toggle } from '@citizenlab/cl2-component-library';
import { MessageDescriptor } from 'react-intl';
import { IOption } from 'typings';

import RadioGroup, { Radio } from 'design-system/RadioGroup';

import { PrescreeningMode } from 'api/phases/types';

import useFeatureFlag from 'hooks/useFeatureFlag';

import { SectionField, SubSectionTitle } from 'components/admin/Section';
import SettingToggleRow from 'components/admin/SettingToggleRow';

import { FormattedMessage, useIntl } from 'utils/cl-intl';

import messages from './messages';
import styles from './PrescreeningModeSelector.module.css';
import 'design-system/tokens.css';

const isPrescreeningMode = (value: string): value is PrescreeningMode =>
  value === 'flagged_only' || value === 'all';

interface Props {
  prescreening_mode: PrescreeningMode | null | undefined;
  onPrescreeningModeChange: (mode: PrescreeningMode | null) => void;
  variant?: 'default' | 'panel';
}

const descriptionMessages: Record<string, MessageDescriptor> = {
  flagged_only: messages.prescreeningModeFlaggedOnlyDescription,
  all: messages.prescreeningModeAllDescriptionWithWarning,
  disabled: messages.prescreeningModeOffDescription,
};

interface SelectProps {
  mode: PrescreeningMode | null | undefined;
  onChange: (mode: PrescreeningMode | null) => void;
}

const PrescreeningSelect = ({ mode, onChange }: SelectProps) => {
  const { formatMessage } = useIntl();
  const value = mode || 'disabled';

  const options: IOption[] = [
    { value: 'disabled', label: formatMessage(messages.prescreeningModeOff) },
    {
      value: 'flagged_only',
      label: formatMessage(messages.prescreeningModeFlaggedOnly),
    },
    { value: 'all', label: formatMessage(messages.prescreeningModeAll) },
  ];

  const handleChange = (option: IOption) => {
    onChange(option.value === 'disabled' ? null : option.value);
  };

  return (
    <>
      <Box maxWidth="300px">
        <Select value={value} options={options} onChange={handleChange} />
      </Box>
      <Text color="coolGrey600" mt="8px" fontSize="s">
        <FormattedMessage {...descriptionMessages[value]} />
      </Text>
    </>
  );
};

interface ToggleProps {
  isEnabled: boolean;
  onChange: () => void;
}

const PrescreeningToggle = ({ isEnabled, onChange }: ToggleProps) => (
  <Toggle
    checked={isEnabled}
    onChange={onChange}
    label={
      <Box ml="8px">
        <Text color="primary" mb="0px" fontSize="m" style={{ fontWeight: 600 }}>
          <FormattedMessage {...messages.inputScreeningToggle} />
        </Text>
        <Text color="coolGrey600" mt="0px" fontSize="m">
          <FormattedMessage {...messages.prescreeningModeAllDescription} />
        </Text>
      </Box>
    }
  />
);

const PrescreeningModeSelector = ({
  prescreening_mode,
  onPrescreeningModeChange,
  variant = 'default',
}: Props) => {
  const { formatMessage } = useIntl();
  const flagInappropriateContentEnabled = useFeatureFlag({
    name: 'flag_inappropriate_content',
  });

  const prescreeningFlaggedOnlyEnabled = useFeatureFlag({
    name: 'prescreening_flagged_only',
  });

  const showFlaggedOnlyOption =
    flagInappropriateContentEnabled && prescreeningFlaggedOnlyEnabled;

  if (variant === 'panel') {
    // Without flagging, 'flagged_only' screens nothing, as on the full page.
    const screening =
      prescreening_mode === 'all' ||
      (showFlaggedOnlyOption && prescreening_mode === 'flagged_only');

    return (
      <div className={styles.panel}>
        <SettingToggleRow
          title={formatMessage(messages.contentScreeningTitle)}
          description={formatMessage(messages.contentScreeningDescription)}
          checked={screening}
          onChange={() => onPrescreeningModeChange(screening ? null : 'all')}
        />
        {screening && showFlaggedOnlyOption && (
          <div className={styles.modes}>
            <RadioGroup
              aria-label={formatMessage(messages.contentScreeningTitle)}
              name="prescreening_mode"
              value={prescreening_mode}
              onChange={(value) => {
                if (isPrescreeningMode(value)) onPrescreeningModeChange(value);
              }}
            >
              <Radio value="flagged_only">
                {formatMessage(messages.prescreeningModeFlaggedOnly)}
              </Radio>
              <Radio value="all">
                {formatMessage(messages.prescreeningModeAll)}
              </Radio>
            </RadioGroup>
            <p className={styles.helper}>
              {formatMessage(descriptionMessages[prescreening_mode])}
            </p>
          </div>
        )}
      </div>
    );
  }

  const settings = (() => {
    if (showFlaggedOnlyOption) {
      return (
        <PrescreeningSelect
          mode={prescreening_mode}
          onChange={onPrescreeningModeChange}
        />
      );
    } else {
      // If flag_inappropriate_content is not enabled, the 'flagged_only' option
      // is not available and is treated as not enabled.
      const isEnabled = prescreening_mode === 'all';

      return (
        <PrescreeningToggle
          isEnabled={isEnabled}
          onChange={() => onPrescreeningModeChange(isEnabled ? null : 'all')}
        />
      );
    }
  })();

  return (
    <SectionField>
      {/*
        The inline style isn't ideal, but it's needed to keep the layout consistent
        with the other section fields on this page.
      */}
      <SubSectionTitle
        style={showFlaggedOnlyOption ? undefined : { marginBottom: 0 }}
      >
        <FormattedMessage {...messages.contentScreeningTitle} />
      </SubSectionTitle>
      {settings}
    </SectionField>
  );
};

export default PrescreeningModeSelector;

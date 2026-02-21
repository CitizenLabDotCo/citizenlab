import React from 'react';

import { Box, Select, Text, Toggle } from '@citizenlab/cl2-component-library';
import { MessageDescriptor } from 'react-intl';
import { IOption } from 'typings';

import { PrescreeningMode } from 'api/phases/types';

import useFeatureFlag from 'hooks/useFeatureFlag';

import { SectionField, SubSectionTitle } from 'components/admin/Section';

import { FormattedMessage, useIntl } from 'utils/cl-intl';

import messages from './messages';

interface Props {
  prescreening_mode: PrescreeningMode | null | undefined;
  onPrescreeningModeChange: (mode: PrescreeningMode | null) => void;
}

const descriptionMessages: Record<string, MessageDescriptor> = {
  flagged_only: messages.prescreeningModeFlaggedOnlyDescription,
  all: messages.prescreeningModeAllDescription,
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
}: Props) => {
  const flagInappropriateContentEnabled = useFeatureFlag({
    name: 'flag_inappropriate_content',
  });

  // This feature flag is temporary and will be removed after rollout.
  const prescreeningFlaggedOnlyEnabled = useFeatureFlag({
    name: 'prescreening_flagged_only',
  });

  const showFlaggedOnlyOption =
    flagInappropriateContentEnabled && prescreeningFlaggedOnlyEnabled;

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

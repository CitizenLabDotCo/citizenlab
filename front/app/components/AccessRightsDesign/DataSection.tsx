// Design prototype – "What we collect": personal info, demographic questions,
// and how the collected data is linked to the submission (anonymity).

import React from 'react';

import {
  Box,
  Text,
  Icon,
  IconNames,
  Toggle,
  Select,
  Radio,
  Error,
  IconButton,
  colors,
} from '@citizenlab/cl2-component-library';

import { DEMOGRAPHIC_FIELDS } from './data';
import {
  DATA_COLLECTION_SUMMARY,
  demographicTitle,
  demographicsSummary,
  piiSummary,
  placementLocked,
} from './logic';
import {
  AccessConfig,
  DataCollection,
  DemographicSelection,
  DemographicsPlacement,
} from './types';
import { SectionHeader, Expander, Hint } from './ui';

const PiiToggle = ({
  icon,
  title,
  description,
  checked,
  disabled,
  onChange,
}: {
  icon: IconNames;
  title: string;
  description: string;
  checked: boolean;
  disabled?: boolean;
  onChange: () => void;
}) => (
  <Box py="8px">
    <Toggle
      checked={checked}
      disabled={disabled}
      onChange={onChange}
      label={
        <Box ml="8px">
          <Box display="flex" alignItems="center" gap="6px">
            <Icon
              name={icon}
              width="16px"
              height="16px"
              fill={checked ? colors.teal500 : colors.coolGrey500}
            />
            <Text as="span" m="0" fontSize="s" fontWeight="semi-bold" color="primary">
              {title}
            </Text>
          </Box>
          <Text as="span" m="0" fontSize="xs" color="coolGrey600">
            {description}
          </Text>
        </Box>
      }
    />
  </Box>
);

const DemographicRow = ({
  selection,
  onChange,
  onRemove,
}: {
  selection: DemographicSelection;
  onChange: (selection: DemographicSelection) => void;
  onRemove: () => void;
}) => (
  <Box
    display="flex"
    alignItems="center"
    justifyContent="space-between"
    gap="8px"
    py="6px"
    px="10px"
    mb="4px"
    borderRadius="6px"
    bgColor={colors.grey50}
  >
    <Text as="span" m="0" fontSize="s" color="primary">
      {demographicTitle(selection.fieldId)}
    </Text>
    <Box display="flex" alignItems="center" gap="4px">
      <Box width="130px">
        <Select
          size="small"
          value={selection.required ? 'required' : 'optional'}
          options={[
            { value: 'required', label: 'Required' },
            { value: 'optional', label: 'Optional' },
          ]}
          onChange={(option) =>
            onChange({ ...selection, required: option.value === 'required' })
          }
        />
      </Box>
      <IconButton
        iconName="delete"
        onClick={onRemove}
        a11y_buttonActionMessage={`Remove ${demographicTitle(selection.fieldId)}`}
        iconColor={colors.coolGrey500}
        iconColorOnHover={colors.red500}
        iconWidth="18px"
      />
    </Box>
  </Box>
);

const ANONYMITY_OPTIONS: {
  value: DataCollection;
  label: string;
  warning?: string;
}[] = [
  {
    value: 'all_data',
    label: 'Link submissions to the participant’s profile (recommended)',
  },
  {
    value: 'demographics_only',
    label: 'Keep demographics in results, but unlink personal info',
    warning:
      'Personal info will not be stored with submissions and cannot be recovered later.',
  },
  {
    value: 'anonymous',
    label: 'Fully anonymous — unlink personal info and demographics',
    warning:
      'Neither personal info nor demographics will be stored with submissions, and cannot be recovered later.',
  },
];

const PLACEMENT_OPTIONS: { value: DemographicsPlacement; label: string }[] = [
  {
    value: 'registration',
    label: 'Ask demographic questions before the user participates',
  },
  {
    value: 'form_page',
    label: 'Collect demographics by adding a new page to the end of the form',
  },
];

interface Props {
  config: AccessConfig;
  passwordAvailable: boolean;
  onChange: (config: AccessConfig) => void;
}

const DataSection = ({ config, passwordAvailable, onChange }: Props) => {
  // PII and anonymity need an account; demographics are collected in any mode.
  const showAccountParts = config.mode === 'account';
  const lockPlacement = placementLocked(config);

  const selectedIds = config.demographics.map((d) => d.fieldId);
  const addableFields = DEMOGRAPHIC_FIELDS.filter(
    (f) => !selectedIds.includes(f.id)
  );

  const activeWarning = ANONYMITY_OPTIONS.find(
    (o) => o.value === config.dataCollection
  )?.warning;

  return (
    <Box>
      <SectionHeader
        icon="user-data"
        title="What we collect"
        tooltip="Information collected from participants, and how it is stored alongside their submission."
      />

      <Box border={`1px solid ${colors.borderLight}`} borderRadius="8px" px="14px">
        {/* Personal info — only meaningful when there's an account. */}
        {showAccountParts && (
          <Expander
            icon="user-circle"
            title="Personal info"
            summary={piiSummary(config)}
          >
            <PiiToggle
              icon="user-circle"
              title="Full name"
              description="Ask for first and last name."
              checked={config.pii.name}
              onChange={() =>
                onChange({
                  ...config,
                  pii: { ...config.pii, name: !config.pii.name },
                })
              }
            />
            <PiiToggle
              icon="lock"
              title="Password"
              description={
                passwordAvailable
                  ? 'Require a password on the account.'
                  : 'Requires the “Confirmed email” method to be enabled.'
              }
              checked={config.pii.password}
              disabled={!passwordAvailable}
              onChange={() =>
                onChange({
                  ...config,
                  pii: { ...config.pii, password: !config.pii.password },
                })
              }
            />
          </Expander>
        )}

        {/* Demographics — available in every mode. */}
        <Box
          borderTop={
            showAccountParts ? `1px solid ${colors.divider}` : undefined
          }
        >
          <Expander
            icon="user-data"
            title="Demographic questions"
            summary={demographicsSummary(config)}
          >
            {/* Where the questions are asked. */}
            <Text as="p" mt="0" mb="6px" fontSize="xs" fontWeight="bold" color="coolGrey600">
              When to ask
            </Text>
            {PLACEMENT_OPTIONS.map((option) => {
              const disabled = lockPlacement && option.value === 'registration';
              return (
                <Box key={option.value} mb="2px">
                  <Radio
                    name="demographics-placement"
                    value={option.value}
                    currentValue={config.demographicsPlacement}
                    disabled={disabled}
                    onChange={(value: DemographicsPlacement) =>
                      onChange({ ...config, demographicsPlacement: value })
                    }
                    label={
                      <Text
                        as="span"
                        m="0"
                        fontSize="s"
                        color={disabled ? 'coolGrey500' : 'primary'}
                      >
                        {option.label}
                      </Text>
                    }
                  />
                </Box>
              );
            })}
            {lockPlacement && (
              <Box mb="10px">
                <Hint>
                  With “Anyone” there is no sign-in step, so demographics can only
                  be asked on a form page.
                </Hint>
              </Box>
            )}

            <Box mt="12px" mb="8px" borderTop={`1px solid ${colors.divider}`} />

            <Text as="p" mt="0" mb="8px" fontSize="xs" fontWeight="bold" color="coolGrey600">
              Questions
            </Text>
            {config.demographics.length === 0 && (
              <Text as="p" mt="0" mb="8px" fontSize="s" color="coolGrey500">
                No demographic questions asked.
              </Text>
            )}

            {config.demographics.map((selection) => (
              <DemographicRow
                key={selection.fieldId}
                selection={selection}
                onChange={(updated) =>
                  onChange({
                    ...config,
                    demographics: config.demographics.map((d) =>
                      d.fieldId === updated.fieldId ? updated : d
                    ),
                  })
                }
                onRemove={() =>
                  onChange({
                    ...config,
                    demographics: config.demographics.filter(
                      (d) => d.fieldId !== selection.fieldId
                    ),
                  })
                }
              />
            ))}

            {addableFields.length > 0 && (
              <Box mt="8px" maxWidth="280px">
                <Select
                  size="small"
                  value={null}
                  placeholder="+ Add a demographic question"
                  options={addableFields.map((f) => ({
                    value: f.id,
                    label: f.title,
                  }))}
                  onChange={(option) =>
                    onChange({
                      ...config,
                      demographics: [
                        ...config.demographics,
                        { fieldId: option.value, required: true },
                      ],
                    })
                  }
                />
              </Box>
            )}
          </Expander>
        </Box>

        {/* Anonymity / data linking — only with an account to link against. */}
        {showAccountParts && (
        <Box borderTop={`1px solid ${colors.divider}`}>
          <Expander
            icon="shield-checkered"
            title="Anonymity in results"
            summary={DATA_COLLECTION_SUMMARY[config.dataCollection]}
          >
            <Text as="p" mt="0" mb="10px" fontSize="xs" color="coolGrey600">
              Independent of what you ask above: you can collect a name yet still
              keep the submission unlinked from the participant’s profile.
            </Text>
            {ANONYMITY_OPTIONS.map((option) => (
              <Box key={option.value} mb="4px">
                <Radio
                  name="data-collection"
                  value={option.value}
                  currentValue={config.dataCollection}
                  onChange={(value: DataCollection) =>
                    onChange({ ...config, dataCollection: value })
                  }
                  label={
                    <Text as="span" m="0" fontSize="s" color="primary">
                      {option.label}
                    </Text>
                  }
                />
              </Box>
            ))}
            {activeWarning && <Error text={activeWarning} />}
          </Expander>
        </Box>
        )}
      </Box>
    </Box>
  );
};

export default DataSection;

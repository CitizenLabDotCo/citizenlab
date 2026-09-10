import React from 'react';

import { Box, Input, Select, Toggle } from '@citizenlab/cl2-component-library';
import { Multiloc } from 'typings';

import { BlockConfigField, BlockConfigValues } from 'api/custom_blocks/types';

import useLocalize from 'hooks/useLocalize';

import InputMultilocWithLocaleSwitcher from 'components/UI/InputMultilocWithLocaleSwitcher';

interface Props {
  schema: BlockConfigField[];
  values: BlockConfigValues;
  onChange: (key: string, value: unknown) => void;
}

const isMultiloc = (value: unknown): value is Multiloc =>
  typeof value === 'object' &&
  value !== null &&
  !Array.isArray(value) &&
  Object.values(value).every((entry) => typeof entry === 'string');

/**
 * Renders the config inputs described by a custom block version's
 * `manifest.config_schema`. Fully controlled: it never holds state of its own,
 * and it never writes defaults back through `onChange` — a field that has no
 * value simply displays the schema default until the user edits it.
 *
 * Deliberately free of craftjs imports: it is also rendered outside the page
 * editor (e.g. in the block builder preview panel).
 */
const ManifestConfigForm = ({ schema, values, onChange }: Props) => {
  const localize = useLocalize();

  const renderControl = (field: BlockConfigField) => {
    const label = localize(field.label);
    const id = `custom-block-config-${field.key}`;
    const currentValue =
      values[field.key] === undefined ? field.default : values[field.key];

    switch (field.type) {
      case 'text':
        return (
          <Input
            id={id}
            type="text"
            label={label}
            value={typeof currentValue === 'string' ? currentValue : ''}
            onChange={(value) => onChange(field.key, value)}
          />
        );

      case 'number':
        return (
          <Input
            id={id}
            type="number"
            label={label}
            value={typeof currentValue === 'number' ? String(currentValue) : ''}
            onChange={(value) => {
              if (value === '') {
                onChange(field.key, undefined);
                return;
              }

              const parsed = Number(value);
              onChange(field.key, Number.isNaN(parsed) ? undefined : parsed);
            }}
          />
        );

      case 'boolean': {
        const checked =
          typeof currentValue === 'boolean' ? currentValue : false;

        return (
          <Toggle
            id={id}
            checked={checked}
            label={label}
            onChange={() => onChange(field.key, !checked)}
          />
        );
      }

      case 'multiloc_text':
        return (
          <InputMultilocWithLocaleSwitcher
            id={id}
            type="text"
            label={label}
            valueMultiloc={isMultiloc(currentValue) ? currentValue : {}}
            onChange={(value) => onChange(field.key, value)}
          />
        );

      case 'select':
        return (
          <Select
            id={id}
            label={label}
            value={typeof currentValue === 'string' ? currentValue : null}
            options={field.options.map((option) => ({
              value: option.value,
              label: localize(option.label),
            }))}
            onChange={(option) => onChange(field.key, option.value)}
          />
        );
    }
  };

  return (
    <>
      {schema.map((field) => (
        <Box key={field.key} marginBottom="20px">
          {renderControl(field)}
        </Box>
      ))}
    </>
  );
};

export default ManifestConfigForm;

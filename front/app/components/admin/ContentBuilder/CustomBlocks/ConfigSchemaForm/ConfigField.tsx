import React from 'react';

import { Input, Select, Toggle } from '@citizenlab/cl2-component-library';
import { Multiloc } from 'typings';

import { ConfigFieldSchema } from 'api/custom_blocks/types';

import InputMultilocWithLocaleSwitcher from 'components/UI/InputMultilocWithLocaleSwitcher';
import ProjectFilter from 'components/UI/ProjectFilter';

interface Props {
  name: string;
  schema: ConfigFieldSchema;
  value: unknown;
  onChange: (value: unknown) => void;
}

const isMultiloc = (value: unknown): value is Multiloc =>
  typeof value === 'object' &&
  value !== null &&
  !Array.isArray(value) &&
  Object.values(value).every((entry) => typeof entry === 'string');

/**
 * One control for one property of a block's `config_schema`.
 *
 * Fully controlled, and it never writes the schema default back through
 * `onChange`: an untouched field shows the default and stays absent from the
 * node's props, so a block keeps rendering as it was generated until someone
 * deliberately changes something.
 */
const ConfigField = ({ name, schema, value, onChange }: Props) => {
  const id = `custom-block-config-${name}`;
  const label = schema.title ?? name;
  const current = value === undefined ? schema.default : value;

  if (schema.type === 'boolean') {
    const checked = typeof current === 'boolean' ? current : false;

    return (
      <Toggle
        id={id}
        checked={checked}
        label={label}
        onChange={() => onChange(!checked)}
      />
    );
  }

  if (schema.type === 'number' || schema.type === 'integer') {
    return (
      <Input
        id={id}
        type="number"
        label={label}
        value={typeof current === 'number' ? String(current) : ''}
        onChange={(next) => {
          if (next === '') {
            onChange(undefined);
            return;
          }

          const parsed =
            schema.type === 'integer' ? parseInt(next, 10) : Number(next);
          onChange(Number.isNaN(parsed) ? undefined : parsed);
        }}
      />
    );
  }

  if (schema['x-multiloc']) {
    return (
      <InputMultilocWithLocaleSwitcher
        id={id}
        type="text"
        label={label}
        valueMultiloc={isMultiloc(current) ? current : {}}
        onChange={(next) => onChange(next)}
      />
    );
  }

  if (schema['x-picker'] === 'project') {
    return (
      <ProjectFilter
        selectedProjectId={typeof current === 'string' ? current : undefined}
        placeholder={label}
        onProjectFilter={({ value: projectId }) => onChange(projectId)}
      />
    );
  }

  if (schema.enum) {
    return (
      <Select
        id={id}
        label={label}
        value={typeof current === 'string' ? current : null}
        options={schema.enum.map((option) => ({
          value: option,
          label: option,
        }))}
        onChange={(option) => onChange(option.value)}
      />
    );
  }

  return (
    <Input
      id={id}
      type="text"
      label={label}
      value={typeof current === 'string' ? current : ''}
      onChange={(next) => onChange(next)}
    />
  );
};

export default ConfigField;

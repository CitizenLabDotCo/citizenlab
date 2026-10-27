import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import { BlockConfigValues, ConfigSchema } from 'api/custom_blocks/types';

import ConfigField from './ConfigField';

interface Props {
  schema: ConfigSchema;
  values: BlockConfigValues;
  onChange: (name: string, value: unknown) => void;
}

/**
 * Renders the settings a custom block declares in `manifest.config_schema`, in the
 * property order its author wrote them in.
 */
const ConfigSchemaForm = ({ schema, values, onChange }: Props) => (
  <>
    {Object.entries(schema.properties ?? {}).map(([name, field]) => (
      <Box key={name} marginBottom="20px">
        <ConfigField
          name={name}
          schema={field}
          value={values[name]}
          onChange={(value) => onChange(name, value)}
        />
      </Box>
    ))}
  </>
);

export default ConfigSchemaForm;

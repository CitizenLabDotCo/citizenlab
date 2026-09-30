import React from 'react';

import { Box, Text, Title } from '@citizenlab/cl2-component-library';
import { useNode } from '@craftjs/core';

import { BlockConfigValues } from 'api/custom_blocks/types';
import useCustomBlockVersion from 'api/custom_blocks/useCustomBlockVersion';

import useLocalize from 'hooks/useLocalize';

import { FormattedMessage } from 'utils/cl-intl';

import ConfigSchemaForm from '../ConfigSchemaForm';
import messages from '../messages';

interface NodeProps {
  blockId?: string;
  version?: number;
  config?: BlockConfigValues;
}

const Settings = () => {
  const localize = useLocalize();
  const {
    actions: { setProp },
    blockId,
    version,
    config,
  } = useNode((node) => ({
    blockId: node.data.props.blockId,
    version: node.data.props.version,
    config: node.data.props.config,
  }));

  // The version the node pins, not the block's newest one: the settings have to
  // describe the code that is actually on the page.
  const { data: blockVersion } = useCustomBlockVersion({ blockId, version });

  if (!blockVersion) return null;

  const { block_title_multiloc, manifest } = blockVersion.data.attributes;
  const schema = manifest.config_schema;
  const hasFields = Object.keys(schema?.properties ?? {}).length > 0;

  return (
    <Box>
      <Title variant="h3" mt="0">
        {localize(block_title_multiloc)}
      </Title>
      {hasFields && schema ? (
        <ConfigSchemaForm
          schema={schema}
          values={config ?? {}}
          onChange={(name, value) => {
            setProp((props: NodeProps) => {
              props.config = { ...(props.config ?? {}), [name]: value };
            });
          }}
        />
      ) : (
        <Text color="textSecondary">
          <FormattedMessage {...messages.noSettings} />
        </Text>
      )}
    </Box>
  );
};

export default Settings;

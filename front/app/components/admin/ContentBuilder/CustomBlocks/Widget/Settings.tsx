import React from 'react';

import { Box, Text, Title } from '@citizenlab/cl2-component-library';
import { useNode } from '@craftjs/core';

import { BlockConfigValues } from 'api/custom_blocks/types';
import useCustomBlock from 'api/custom_blocks/useCustomBlock';

import useLocalize from 'hooks/useLocalize';

import ManifestConfigForm from '../ManifestConfigForm';

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
    config,
  } = useNode((node) => ({
    blockId: node.data.props.blockId,
    config: node.data.props.config,
  }));

  const { data: block } = useCustomBlock(blockId);

  if (!block) return null;

  const { title_multiloc, current_version } = block.data.attributes;
  const schema = current_version?.manifest.config_schema ?? [];

  return (
    <Box>
      <Title variant="h3" mt="0">
        {localize(title_multiloc)}
      </Title>
      {schema.length === 0 ? (
        <Text color="textSecondary">—</Text>
      ) : (
        <ManifestConfigForm
          schema={schema}
          values={config ?? {}}
          onChange={(key, value) => {
            setProp((props: NodeProps) => {
              props.config = { ...(props.config ?? {}), [key]: value };
            });
          }}
        />
      )}
    </Box>
  );
};

export default Settings;

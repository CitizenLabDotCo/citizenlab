import React, { useState } from 'react';

import { Box, Text, Title } from '@citizenlab/cl2-component-library';
import { useNode } from '@craftjs/core';

import { BlockConfigValues } from 'api/custom_blocks/types';
import useCustomBlockVersion from 'api/custom_blocks/useCustomBlockVersion';

import useLocalize from 'hooks/useLocalize';

import Tabs from 'components/UI/Tabs';

import { FormattedMessage, useIntl } from 'utils/cl-intl';

import ConfigSchemaForm from '../ConfigSchemaForm';
import messages from '../messages';

import catalogueValues from './catalogueValues';
import DataTab from './DataTab';

interface NodeProps {
  blockId?: string;
  version?: number;
  config?: BlockConfigValues;
}

const SETTINGS = 'settings';
const DATA = 'data';

const Settings = () => {
  const localize = useLocalize();
  const { formatMessage } = useIntl();
  const [tab, setTab] = useState<typeof SETTINGS | typeof DATA>(SETTINGS);
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

  const {
    block_title_multiloc,
    manifest,
    messages: catalogue,
    data_sources,
    created_at,
  } = blockVersion.data.attributes;
  const schema = manifest.config_schema;
  const hasFields = Object.keys(schema?.properties ?? {}).length > 0;

  // A block that reads nothing has nothing to explain, so it keeps the single
  // settings pane it has always had.
  const hasData = (manifest.queries?.length ?? 0) > 0;
  // Tab names become DOM ids, so they carry the block they belong to.
  const tabName = (value: string) => `${value}-${blockId}`;

  return (
    <Box>
      <Title variant="h3" mt="0">
        {localize(block_title_multiloc)}
      </Title>

      {hasData && (
        <Box mb="20px">
          <Tabs
            fullWidth
            items={[
              {
                name: tabName(SETTINGS),
                label: formatMessage(messages.settingsTab),
              },
              { name: tabName(DATA), label: formatMessage(messages.dataTab) },
            ]}
            selectedValue={tabName(tab)}
            onClick={(name) => setTab(name === tabName(DATA) ? DATA : SETTINGS)}
          />
        </Box>
      )}

      {hasData && tab === DATA ? (
        <DataTab
          explanation={manifest.explanation}
          dataSources={data_sources}
          createdAt={created_at}
        />
      ) : (
        <>
          {hasFields && schema ? (
            <ConfigSchemaForm
              schema={schema}
              values={catalogueValues(schema, catalogue, config ?? {})}
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
        </>
      )}
    </Box>
  );
};

export default Settings;

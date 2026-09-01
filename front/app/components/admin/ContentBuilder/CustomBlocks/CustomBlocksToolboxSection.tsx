import React, { useState } from 'react';

import { Box, Button } from '@citizenlab/cl2-component-library';

import useCustomBlocks from 'api/custom_blocks/useCustomBlocks';

import useLocalize from 'hooks/useLocalize';

import DraggableElement from 'components/admin/ContentBuilder/Toolbox/DraggableElement';
import Section from 'components/admin/ContentBuilder/Toolbox/Section';

import { useIntl } from 'utils/cl-intl';

import AiPanel from './AiPanel';
import messages from './messages';
import { defaultConfigValues } from './utils';
import CustomBlock from './Widget';

// Rendered by the homepage builder toolbox only when the 'custom_page_blocks'
// feature is enabled.
const CustomBlocksToolboxSection = () => {
  const { formatMessage } = useIntl();
  const localize = useLocalize();
  const [panelOpen, setPanelOpen] = useState(false);
  const { data: blocks } = useCustomBlocks({ status: 'published' });

  return (
    <Section>
      <Box px="10px" mb="8px">
        <Button
          id="e2e-build-custom-block"
          buttonStyle="secondary-outlined"
          size="s"
          width="100%"
          onClick={() => setPanelOpen(true)}
        >
          {formatMessage(messages.buildWithAi)}
        </Button>
      </Box>
      {blocks?.data.map((block) => {
        const version = block.attributes.current_version;
        if (!version) return null;

        return (
          <DraggableElement
            key={block.id}
            id={`e2e-draggable-custom-block-${block.id}`}
            component={
              <CustomBlock
                blockId={block.id}
                version={version.number}
                config={defaultConfigValues(version.manifest.config_schema)}
              />
            }
            icon="flash"
            label={localize(block.attributes.title_multiloc)}
          />
        );
      })}
      {panelOpen && <AiPanel onClose={() => setPanelOpen(false)} />}
    </Section>
  );
};

export default CustomBlocksToolboxSection;

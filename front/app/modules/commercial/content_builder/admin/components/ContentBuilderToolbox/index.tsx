import React from 'react';

// Craft
import { useEditor, Element } from '@craftjs/core';

// Intl
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';

// Components
import ToolboxItem from './ToolboxItem';
import { Box } from '@citizenlab/cl2-component-library';
import Container from '../CraftComponents/Container';
import Text from '../CraftComponents/Text';

// Intl
import messages from '../../messages';

const ContentBuilderToolbox = ({
  intl: { formatMessage },
}: InjectedIntlProps) => {
  const { connectors } = useEditor();

  return (
    <Box w="100%" display="inline" marginTop="20px">
      <div
        ref={(ref) =>
          ref &&
          connectors.create(
            ref,
            <Element canvas is={Container} id="container" />
          )
        }
      >
        <ToolboxItem icon="column1" label={formatMessage(messages.oneColumn)} />
      </div>
      <div
        ref={(ref) =>
          ref &&
          connectors.create(ref, <Element canvas is={Text} id="text" text="" />)
        }
      >
        <ToolboxItem icon="text" label={formatMessage(messages.text)} />
      </div>
    </Box>
  );
};

export default injectIntl(ContentBuilderToolbox);

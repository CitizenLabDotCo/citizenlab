import React from 'react';

// craft
import { useEditor, Element } from '@craftjs/core';
import Container from '../CraftComponents/Container';

// intl
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from '../../messages';
import { Box } from '@citizenlab/cl2-component-library';

const ContentBuilderToolbox = ({
  intl: { formatMessage },
}: InjectedIntlProps) => {
  const { connectors } = useEditor();
  return (
    <Box marginTop="20px">
      <button
        ref={(ref) =>
          ref &&
          connectors.create(
            ref,
            <Element canvas is={Container} id="container" />
          )
        }
      >
        {formatMessage(messages.oneColumn)}
      </button>
    </Box>
  );
};

export default injectIntl(ContentBuilderToolbox);

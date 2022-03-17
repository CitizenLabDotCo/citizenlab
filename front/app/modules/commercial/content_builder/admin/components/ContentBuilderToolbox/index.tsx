import React from 'react';
import { useEditor, Element } from '@craftjs/core';

import Container from '../CraftComponents/Container';
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from '../../messages';

const ContentBuilderToolbox = ({
  intl: { formatMessage },
}: InjectedIntlProps) => {
  const { connectors } = useEditor();
  return (
    <button
      ref={(ref) =>
        ref &&
        connectors.create(ref, <Element canvas is={Container} id="container" />)
      }
    >
      {formatMessage(messages.oneColumn)}
    </button>
  );
};

export default injectIntl(ContentBuilderToolbox);

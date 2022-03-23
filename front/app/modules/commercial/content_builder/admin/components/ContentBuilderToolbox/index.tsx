import React from 'react';

// intl
import { injectIntl } from 'utils/cl-intl';

// Components
import ToolboxItem from './ToolboxItem';

// Intl
import messages from '../../messages';

const ContentBuilderToolbox = () => {
  return (
    <>
      <ToolboxItem label={messages.oneColumn} componentType={'Container'} />
      <ToolboxItem label={messages.text} componentType={'Text'} />
    </>
  );
};

export default injectIntl(ContentBuilderToolbox);

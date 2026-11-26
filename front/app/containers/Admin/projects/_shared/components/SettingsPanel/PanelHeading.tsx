import React, { useContext } from 'react';

import IconButton from 'design-system/IconButton';
import PanelGroupHeader from 'design-system/PanelGroupHeader';

import { useIntl } from 'utils/cl-intl';

import ExpandAllContext from './ExpandAllContext';
import messages from './messages';
import 'design-system/tokens.css';

interface Props {
  label: string;
  expandable?: boolean;
}

const PanelHeading = ({ label, expandable = false }: Props) => {
  const { formatMessage } = useIntl();
  const { expand } = useContext(ExpandAllContext);

  return (
    <PanelGroupHeader
      label={label}
      action={
        expandable &&
        expand && (
          <IconButton
            icon="chevrons-up-down-16"
            aria-label={formatMessage(messages.expandAll)}
            onPress={expand}
          />
        )
      }
    />
  );
};

export default PanelHeading;

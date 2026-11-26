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
  const { opened, toggle } = useContext(ExpandAllContext);

  return (
    <PanelGroupHeader
      label={label}
      action={
        expandable &&
        toggle && (
          <IconButton
            icon="rows-expand-16"
            aria-label={formatMessage(
              opened ? messages.collapseAll : messages.expandAll
            )}
            onPress={toggle}
          />
        )
      }
    />
  );
};

export default PanelHeading;

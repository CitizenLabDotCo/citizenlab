import React from 'react';

import { Button } from '@citizenlab/cl2-component-library';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';

interface Props {
  onClick: () => void;
  dataCy?: string;
}

const ClearFiltersButton = ({ onClick, dataCy }: Props) => {
  const { formatMessage } = useIntl();

  return (
    <Button
      buttonStyle="secondary-outlined"
      size="s"
      icon="close"
      iconSize="16px"
      onClick={onClick}
      text={formatMessage(messages.clearFilters)}
      m="0"
      dataCy={dataCy}
    />
  );
};

export default ClearFiltersButton;

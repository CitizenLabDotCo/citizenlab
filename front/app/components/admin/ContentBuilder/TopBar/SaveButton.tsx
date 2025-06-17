import React from 'react';

import { colors } from '@citizenlab/cl2-component-library';

import ButtonWithLink from 'components/UI/ButtonWithLink';

import { FormattedMessage } from 'utils/cl-intl';

import messages from './messages';

interface Props {
  isDisabled: boolean;
  isLoading: boolean;
  isSaved?: boolean;
  onSave: () => void;
}

const SaveButton = ({
  isDisabled,
  isLoading,
  isSaved,
  onSave: handleSave,
}: Props) => {
  return (
    <ButtonWithLink
      id="e2e-content-builder-topbar-save"
      data-testid="contentBuilderTopBarSaveButton"
      buttonStyle="primary"
      disabled={isDisabled}
      processing={isLoading}
      bgColor={isSaved ? colors.success : undefined}
      icon={isSaved ? 'check' : undefined}
      fontSize="14px"
      ml="8px"
      px="12px"
      pb="3px"
      pt="4px"
      onClick={handleSave}
    >
      <FormattedMessage {...messages.contentBuilderSave} />
    </ButtonWithLink>
  );
};

export default SaveButton;

import React from 'react';

import { Icon } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import { ScreenReaderOnly } from 'utils/a11y';
import { useIntl } from 'utils/cl-intl';
import { removeFocusAfterMouseClick } from 'utils/helperUtils';

import messages from './messages';

const RemoveIcon = styled(Icon)`
  fill: #fff;
  transition: all 100ms ease-out;
`;

const RemoveButton = styled.button`
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  margin: 0;
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 1;
  cursor: pointer;
  border-radius: 50%;
  border: solid 1px transparent;
  background: rgba(0, 0, 0, 0.6);
  transition: all 100ms ease-out;

  &:hover {
    background: #000;
    border-color: #fff;

    ${RemoveIcon} {
      fill: #fff;
    }
  }
`;

type Props = {
  onClick: (event: React.FormEvent) => void;
  removeIconAriaTitle?: string;
};

const RemoveImageButton = ({ removeIconAriaTitle, onClick }: Props) => {
  const { formatMessage } = useIntl();

  return (
    <RemoveButton
      data-cy="e2e-remove-image-button"
      type="button"
      onMouseDown={removeFocusAfterMouseClick}
      onClick={onClick}
      className="remove-button"
    >
      <RemoveIcon name="close" />
      <ScreenReaderOnly>
        {removeIconAriaTitle || formatMessage(messages.a11y_removeImage)}
      </ScreenReaderOnly>
    </RemoveButton>
  );
};

export default RemoveImageButton;

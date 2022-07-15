import React from 'react';

// components
import {
  IconTooltip,
  Toggle,
  Box,
  Title,
} from '@citizenlab/cl2-component-library';
import { Row } from 'components/admin/ResourceList';
import AdminEditButton from './AdminEditButton';
import { FormattedMessage, MessageDescriptor } from 'utils/cl-intl';

export interface Props {
  onChangeSectionToggle: () => void;
  onClickEditButton?: (string) => void;
  titleMessageDescriptor: MessageDescriptor;
  tooltipMessageDescriptor: MessageDescriptor;
  checked: boolean;
  disabled: boolean;
  editLinkPath?: string;
}

const SectionToggle = ({
  onChangeSectionToggle,
  onClickEditButton,
  titleMessageDescriptor,
  tooltipMessageDescriptor,
  editLinkPath,
  checked,
  disabled,
}: Props) => {
  return (
    <Row>
      <Box display="flex" alignItems="center">
        <Box mr="20px">
          <Toggle
            checked={checked}
            onChange={onChangeSectionToggle}
            disabled={disabled}
          />
        </Box>
        {/*
      Note: I think we want a default font-weigt of 600, not 700 for this component.
      Also, the margin-top is more than margin-bottom (for an h3).
      */}
        <Title variant="h3" mr="10px">
          <FormattedMessage {...titleMessageDescriptor} />
        </Title>
        <IconTooltip
          content={<FormattedMessage {...tooltipMessageDescriptor} />}
        />
      </Box>
      {editLinkPath && onClickEditButton && (
        <AdminEditButton onClick={() => onClickEditButton(editLinkPath)} />
      )}
    </Row>
  );
};

export default SectionToggle;

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
  onClickEditButton?: () => void;
  titleMessageDescriptor: MessageDescriptor;
  tooltipMessageDescriptor: MessageDescriptor;
  checked: boolean;
  disabled: boolean;
}

const SectionToggle = ({
  onChangeSectionToggle,
  onClickEditButton,
  titleMessageDescriptor,
  tooltipMessageDescriptor,
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
      {onClickEditButton && <AdminEditButton onClick={onClickEditButton} />}
    </Row>
  );
};

export default SectionToggle;

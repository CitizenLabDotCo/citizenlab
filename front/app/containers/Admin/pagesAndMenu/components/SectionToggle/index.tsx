import React from 'react';

// components
import {
  Box,
  IconTooltip,
  Title,
  Toggle,
} from '@citizenlab/cl2-component-library';
import { Row } from 'components/admin/ResourceList';
import { FormattedMessage, MessageDescriptor } from 'utils/cl-intl';
import AdminEditButton from './AdminEditButton';

export interface Props {
  onChangeSectionToggle: () => void;
  onClickEditButton?: (editLinkPath: string) => void;
  titleMessageDescriptor: MessageDescriptor;
  tooltipMessageDescriptor: MessageDescriptor;
  checked: boolean;
  editLinkPath?: string;
  isLastItem: boolean;
  hideToggle?: boolean;
  name?: string;
}

const SectionToggle = ({
  onChangeSectionToggle,
  onClickEditButton,
  titleMessageDescriptor,
  tooltipMessageDescriptor,
  editLinkPath,
  checked,
  isLastItem,
  hideToggle = false,
  name,
}: Props) => {
  return (
    <Row isLastItem={isLastItem}>
      <Box
        pt="5px"
        pb="5px"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Box
          visibility={hideToggle ? 'hidden' : 'visible'}
          mr="20px"
          mt="7px"
          data-cy={`e2e-admin-section-toggle-${name}`}
        >
          <Toggle checked={checked} onChange={onChangeSectionToggle} />
        </Box>
        <Box>
          <Title mr="10px">
            <FormattedMessage {...titleMessageDescriptor} />
          </Title>
        </Box>
        <Box>
          <IconTooltip
            content={<FormattedMessage {...tooltipMessageDescriptor} />}
          />
        </Box>
      </Box>
      {editLinkPath && onClickEditButton && (
        <AdminEditButton
          onClick={() => onClickEditButton(editLinkPath)}
          testId={name}
        />
      )}
    </Row>
  );
};

export default SectionToggle;

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

import { THomepageSectionToggleData } from '../../containers/EditHomepage';
import { TCustomPageSectionToggleData } from '../../containers/CustomPages/Edit/Content';

export interface TSectionToggleData {
  titleMessageDescriptor: MessageDescriptor;
  tooltipMessageDescriptor: MessageDescriptor;
  linkToPath?: string;
  hideToggle?: boolean;
}

interface Props {
  sectionToggleData: THomepageSectionToggleData | TCustomPageSectionToggleData;
  onChangeSectionToggle: () => void;
  onClickEditButton?: (editLinkPath: string) => void;
  checked: boolean;
  isLastItem: boolean;
}

const SectionToggle = ({
  onChangeSectionToggle,
  onClickEditButton,
  checked,
  isLastItem,
  sectionToggleData: {
    titleMessageDescriptor,
    tooltipMessageDescriptor,
    name,
    linkToPath,
    hideToggle = false,
  },
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
      {linkToPath && onClickEditButton && (
        <AdminEditButton
          onClick={() => onClickEditButton(linkToPath)}
          testId={name}
        />
      )}
    </Row>
  );
};

export default SectionToggle;
